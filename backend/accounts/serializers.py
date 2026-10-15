from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils.crypto import constant_time_compare
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.utils import get_md5_hash_password

from Teachers.models import Teacher
from student.models import Student
from .models import StudentProfile, TeacherProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'display_name', 'role', 'must_change_password', 'is_active')
        read_only_fields = fields

    def get_display_name(self, user):
        return user.get_full_name() or user.username


def session_data(user):
    data = UserSerializer(user).data
    return {'user': data, 'role': user.role, 'username': user.username, 'must_change_password': user.must_change_password}


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['version'] = user.token_version
        return token

    def validate(self, attrs):
        return {**super().validate(attrs), **session_data(self.user)}


class RefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        token = self.token_class(attrs['refresh'])
        user = User.objects.filter(pk=token['user_id'], is_active=True).first()
        if not user or token.get('version') != user.token_version or not constant_time_compare(
            token.get(api_settings.REVOKE_TOKEN_CLAIM, ''), get_md5_hash_password(user.password)
        ):
            raise AuthenticationFailed('This session has expired. Sign in again.')
        return {**super().validate(attrs), **session_data(user)}


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({'current_password': ['The current password is incorrect.']})
        if user.check_password(attrs['new_password']):
            raise serializers.ValidationError({'new_password': ['Choose a different password.']})
        try:
            validate_password(attrs['new_password'], user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({'new_password': error.messages}) from error
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(trim_whitespace=False)


class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, trim_whitespace=False)
    record_id = serializers.IntegerField(write_only=True, required=False, min_value=1)
    record = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'role',
                  'must_change_password', 'password', 'record_id', 'record')
        read_only_fields = ('id', 'role', 'must_change_password', 'record')

    def get_record(self, user):
        profile = getattr(user, f'{user.role}_profile', None)
        record = getattr(profile, user.role, None)
        return {'id': record.pk, 'name': record.fullname} if record else None

    def validate(self, attrs):
        forbidden = set(self.initial_data) - {'username', 'email', 'first_name', 'last_name', 'is_active', 'password', 'record_id'}
        if forbidden:
            raise serializers.ValidationError({name: ['This field cannot be changed.'] for name in forbidden})
        if self.instance and ('record_id' in attrs or 'password' in attrs):
            raise serializers.ValidationError('Account links and passwords cannot be edited here. Use change-password for passwords.')
        if not self.instance:
            if not attrs.get('password'):
                raise serializers.ValidationError({'password': ['A temporary password is required.']})
            role = self.context['role']
            model, profile_model = (Teacher, TeacherProfile) if role == 'teacher' else (Student, StudentProfile)
            record = model.objects.filter(pk=attrs.get('record_id')).first()
            if not record:
                raise serializers.ValidationError({'record_id': ['Select an existing school record.']})
            if profile_model.objects.filter(**{role: record}).exists():
                raise serializers.ValidationError({'record_id': ['This record already has an account.']})
            try:
                validate_password(attrs['password'], User(**{key: value for key, value in attrs.items() if key not in ('password', 'record_id')}))
            except DjangoValidationError as error:
                raise serializers.ValidationError({'password': error.messages}) from error
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        record_id = validated_data.pop('record_id')
        role = self.context['role']
        user = User.objects.create_user(role=role, must_change_password=True, **validated_data)
        profile_model = TeacherProfile if role == 'teacher' else StudentProfile
        profile_model.objects.create(user=user, **{f'{role}_id': record_id})
        return user

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .permissions import IsAdmin, IsStudent, IsTeacher, PasswordChanged
from .serializers import AccountSerializer, ChangePasswordSerializer, LoginSerializer, LogoutSerializer, RefreshSerializer, session_data


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    throttle_scope = 'login'


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    serializer_class = RefreshSerializer
    throttle_scope = 'login'


class MeView(APIView):
    permission_classes = [IsAdmin | IsTeacher | IsStudent]

    def get(self, request):
        return Response(session_data(request.user))


class ChangePasswordView(APIView):
    permission_classes = [IsAdmin | IsTeacher | IsStudent]

    def post(self, request):
        with transaction.atomic():
            user = get_user_model().objects.select_for_update().get(pk=request.user.pk)
            request.user = user
            serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            user.set_password(serializer.validated_data['new_password'])
            user.must_change_password = False
            user.save(update_fields=['password', 'must_change_password'])
            refresh = LoginSerializer.get_token(user)
        # All old access AND refresh tokens carry the previous password hash.
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh), **session_data(user)})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data['refresh'])
            if str(token['user_id']) != str(request.user.pk):
                raise ValidationError('This refresh token belongs to another account.')
            token.blacklist()
        except TokenError as error:
            raise InvalidToken(str(error)) from error
        return Response(status=status.HTTP_204_NO_CONTENT)


class AccountMixin:
    permission_classes = [IsAdmin, PasswordChanged]
    serializer_class = AccountSerializer
    role = None

    def get_queryset(self):
        return get_user_model().objects.filter(role=self.role).select_related(f'{self.role}_profile__{self.role}').order_by('username')

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'role': self.role}


class AccountListCreateView(AccountMixin, generics.ListCreateAPIView):
    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError as error:
            raise ValidationError('The username or school record already has an account.') from error


class AccountDetailView(AccountMixin, generics.RetrieveUpdateAPIView):
    http_method_names = ['get', 'patch', 'head', 'options']

    def perform_update(self, serializer):
        try:
            with transaction.atomic():
                user = serializer.save()
                if not user.is_active:
                    # Invalidate every token, including tokens issued before reactivation.
                    for token in OutstandingToken.objects.filter(user=user):
                        BlacklistedToken.objects.get_or_create(token=token)
        except IntegrityError as error:
            raise ValidationError('This username is already in use.') from error

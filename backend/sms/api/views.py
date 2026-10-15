"""Role-scoped DRF records API. Every object lookup uses the filtered queryset."""
from django.db import IntegrityError, transaction
from django.db.models.deletion import Collector, ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsStudent, IsTeacher, PasswordChanged
from .resources import RESOURCES


class RecordsView(generics.GenericAPIView):
    permission_classes = [IsAdmin | IsTeacher | IsStudent, PasswordChanged]

    def get_resource(self):
        resource = RESOURCES.get(self.kwargs['resource_name'])
        if not resource:
            raise NotFound('This resource does not exist.')
        return resource

    def get_queryset(self):
        queryset = self.get_resource().queryset()
        user = self.request.user
        name = self.kwargs['resource_name']
        if user.role == 'admin':
            return queryset
        if user.role == 'teacher':
            profile = getattr(user, 'teacher_profile', None)
            if not profile:
                return queryset.none()
            teacher_id = profile.teacher_id
            filters = {
                'teachers': {'pk': teacher_id},
                'groups': {'teacher_id': teacher_id},
                'students': {'group__teacher_id': teacher_id},
                'exams': {'group__teacher_id': teacher_id},
                'scores': {'student__group__teacher_id': teacher_id},
            }
        else:
            profile = getattr(user, 'student_profile', None)
            if not profile:
                return queryset.none()
            student = profile.student
            filters = {
                'students': {'pk': student.pk},
                'groups': {'pk': student.group_id},
                'exams': {'group_id': student.group_id},
                'scores': {'student_id': student.pk},
            }
        # Administrator and teacher contact records are not student data.
        return queryset.filter(**filters[name]) if name in filters else queryset.none()

    def get_object(self):
        instance = get_object_or_404(self.get_queryset(), pk=self.kwargs['record_id'])
        self.check_object_permissions(self.request, instance)
        return instance

    def get(self, request, **kwargs):
        resource = self.get_resource()
        if 'record_id' in kwargs:
            return Response({'record': resource.serialize(self.get_object())})
        return Response({'results': [resource.serialize(record) for record in self.get_queryset()]})

    def require_admin_write(self):
        if not IsAdmin().has_permission(self.request, self):
            raise PermissionDenied('Only administrators can change school records.')
        if self.get_resource().readonly:
            raise PermissionDenied('Administrator records are managed in Django admin.')

    def save_record(self, instance=None):
        self.require_admin_write()
        resource = self.get_resource()
        payload = self.request.data
        if not isinstance(payload, dict):
            raise ValidationError('Send a JSON object.')
        unknown = set(payload) - set(resource.fields)
        if unknown:
            raise ValidationError({name: ['Unknown or read-only field.'] for name in sorted(unknown)})
        if instance is not None:
            current = resource.serialize(instance)
            payload = {**{name: current[name] for name in resource.fields}, **payload}
        invalid = {name: ['Enter a single value.'] for name, value in payload.items() if isinstance(value, (dict, list, bool))}
        if invalid:
            raise ValidationError(invalid)
        form = resource.form(payload, instance)
        if not form.is_valid():
            raise ValidationError({name: list(messages) for name, messages in form.errors.items()})
        try:
            with transaction.atomic():
                record = form.save()
        except IntegrityError:
            return Response({'message': 'A related record changed or a unique value is already in use.'}, status=409)
        return Response({'record': resource.serialize(record)}, status=200 if instance else 201)

    def post(self, request, **kwargs):
        if 'record_id' in kwargs:
            return Response(status=405)
        return self.save_record()

    def patch(self, request, **kwargs):
        self.require_admin_write()
        if 'record_id' not in kwargs:
            return Response(status=405)
        return self.save_record(self.get_object())

    def delete(self, request, **kwargs):
        self.require_admin_write()
        if 'record_id' not in kwargs:
            return Response(status=405)
        instance = self.get_object()
        try:
            with transaction.atomic():
                collector = Collector(using=instance._state.db)
                collector.collect([instance])
                has_cascade = any(record != instance for records in collector.data.values() for record in records) or any(queryset.exists() for queryset in collector.fast_deletes)
                if has_cascade:
                    return Response({'message': 'This record has dependent records. Remove or reassign them before deleting it.'}, status=409)
                collector.delete()
        except ProtectedError:
            return Response({'message': 'This record has a linked account. Deactivate the account instead.'}, status=409)
        return Response(status=204)

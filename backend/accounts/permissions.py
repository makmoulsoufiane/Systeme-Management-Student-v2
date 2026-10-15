from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    role = None

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and user.role == self.role)


class IsAdmin(RolePermission):
    role = 'admin'


class IsTeacher(RolePermission):
    role = 'teacher'


class IsStudent(RolePermission):
    role = 'student'


class PasswordChanged(BasePermission):
    message = 'Change your password before accessing school records.'
    code = 'password_change_required'

    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and not request.user.must_change_password)

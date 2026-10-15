from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import StudentProfile, TeacherProfile, User


@admin.register(User)
class SchoolUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (('School access', {'fields': ('role', 'must_change_password')}),)
    add_fieldsets = UserAdmin.add_fieldsets + (('School access', {'fields': ('role', 'must_change_password')}),)
    list_display = ('username', 'role', 'is_active', 'must_change_password')


admin.site.register(TeacherProfile)
admin.site.register(StudentProfile)

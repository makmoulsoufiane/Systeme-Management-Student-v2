from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class SchoolUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields['role'] = 'admin'
        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        TEACHER = 'teacher', 'Teacher'
        STUDENT = 'student', 'Student'

    # Reuse the existing table and integer IDs, including admin log references.
    id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    must_change_password = models.BooleanField(default=True)
    token_version = models.PositiveIntegerField(default=0, editable=False)
    objects = SchoolUserManager()

    class Meta(AbstractUser.Meta):
        db_table = 'auth_user'
        swappable = 'AUTH_USER_MODEL'

    def save(self, *args, **kwargs):
        if self.pk:
            previous = type(self).objects.filter(pk=self.pk).values('role', 'is_active', 'token_version').first()
            if previous and (previous['role'] != self.role or (previous['is_active'] and not self.is_active)):
                self.token_version = previous['token_version'] + 1
        self.is_staff = self.role == self.Role.ADMIN
        if self.role != self.Role.ADMIN:
            self.is_superuser = False
        if kwargs.get('update_fields') is not None:
            kwargs['update_fields'] = set(kwargs['update_fields']) | {'is_staff', 'is_superuser', 'token_version'}
        super().save(*args, **kwargs)


class TeacherProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
    teacher = models.OneToOneField('Teachers.Teacher', on_delete=models.PROTECT, related_name='account_profile')


class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    student = models.OneToOneField('student.Student', on_delete=models.PROTECT, related_name='account_profile')

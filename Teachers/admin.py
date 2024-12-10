# Register your models here.

from django.contrib import admin
from .models import Teacher

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('id_teacher', 'fullname', 'adress', 'date_of_inscription')

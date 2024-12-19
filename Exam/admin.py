from django.contrib import admin
from .models import Exam

@admin.register(Exam)  # Correct decorator
class ExamAdmin(admin.ModelAdmin):  # Custom admin class
    '''This list will display as a table in the admin panel'''
    list_display = ('id_exam', 'date_of_inscription', 'place', 'name')


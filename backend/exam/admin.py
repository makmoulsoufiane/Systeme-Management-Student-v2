from django.contrib import admin
from .models import Exam  

@admin.register(Exam)  
class ExamAdmin(admin.ModelAdmin):  
    ''' This list will display as a table in the admin panel '''
    list_display = ('id_exam', 'date_hour', 'place', 'name') 
    
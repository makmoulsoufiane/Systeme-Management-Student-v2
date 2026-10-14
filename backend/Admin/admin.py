from django.contrib import admin
from .models import Admin

@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    ''' this list will display as a table'''
    list_display = ('id_admin', 'fullname', 'address', 'date_of_inscription')
    
    
    

from django.contrib import admin
from .models import Admin

@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    
    list_display = ('id_admin', 'fullname_admin', 'address', 'date_of_inscription')
    
    
    

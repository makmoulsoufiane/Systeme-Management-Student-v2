from django.db import models

# Create your models here.

class Admin(models.Model):
    id_admin = models.AutoField(primary_key=True) 
    fullname = models.CharField(max_length=50)
    address = models.CharField(max_length=255)
    date_of_inscription = models.DateField()

    class Meta:
        db_table = "Admin"
    
    
    def __str__(self):
        return self.fullname_admin
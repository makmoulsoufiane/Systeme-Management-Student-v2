from django.db import models
from django.urls import reverse

# Create your models here.

class Admin(models.Model):
    id_admin = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    date_of_inscription = models.DateField()

    class Meta:
        db_table = "Admin"


    def __str__(self):
        return self.fullname


    def get_absolute_url(self):
        return reverse('admin-detail', args=[str(self.id_admin)])

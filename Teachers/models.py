from django.db import models
from Admin.models import Admin  # Importing Admin model for the relationship


class Teacher(models.Model):
    id_teacher = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=100)
    adress = models.CharField(max_length=255)
    date_of_inscription = models.DateField()
    admin = models.ForeignKey(Admin, on_delete=models.SET_NULL, null=True, related_name="managed_teachers")  # Admin managing the teacher


    def __str__(self):
        return self.fullname

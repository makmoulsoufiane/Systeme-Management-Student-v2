from django.db import models


class Teacher(models.Model):
    id_teacher = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=100)
    adress = models.CharField(max_length=255)
    date_of_inscription = models.DateField()

    def __str__(self):
        return self.fullname
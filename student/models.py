from django.db import models

class Student(models.Model):
    id_student = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=100)  # Adjusted length for full name
    address = models.CharField(max_length=255)
    date_of_inscription = models.DateField()  # Using 'date_of_inscription' as per your request

    def __str__(self):
        return self.fullname

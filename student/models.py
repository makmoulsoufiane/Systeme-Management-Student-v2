from django.db import models
from Admin.models import Admin

class Student(models.Model):
    id_student = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=100)  # Adjusted length for full name
    address = models.CharField(max_length=255)
    date_of_inscription = models.DateField()  # Using 'date_of_inscription' as per your request
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='students')

    class Meta:
        db_table = "student"  # تحديد اسم الجدول في قاعدة البيانات



    def __str__(self):
        return self.fullname

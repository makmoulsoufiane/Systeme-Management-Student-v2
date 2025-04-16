from django.db import models
from Admin.models import Admin
from django.urls import reverse



class Teacher(models.Model):
    id_teacher = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=100)
    adress = models.CharField(max_length=255)
    date_of_inscription = models.DateField()
    admin = models.ForeignKey(Admin, on_delete=models.SET_NULL, null=True, related_name="teachers")  # Admin managing the teacher



    class Meta:
        db_table = "teacher"

    def __str__(self):
        return f"{self.fullname}, {self.adress}, {self.date_of_inscription}, {self.admin}"


    def get_absolute_url(self):
        return reverse('teacher-detail', args=[str(self.id_teacher)])

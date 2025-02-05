from django.db import models
from Teachers.models import Teacher
from Group.models import Group

# Create your models here.

class Exam(models.Model):
    id_exam = models.AutoField(primary_key=True)
    date_hour = models.DateTimeField()
    place = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='exams', null=True, blank=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='exams', null=True, blank=True)


    class Meta:
        db_table = "exam"


    def __str__(self):
        return self.name

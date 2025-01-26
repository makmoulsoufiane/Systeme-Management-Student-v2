from django.db import models
from Teachers.models import Teacher

# Create your models here.

class exam(models.Model):
    id_exam = models.AutoField(primary_key=True) 
    date_hour = models.DateTimeField()
    place = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='exams')


    class Meta:
        db_table = "exam"
    
    
    def __str__(self):
        return self.name
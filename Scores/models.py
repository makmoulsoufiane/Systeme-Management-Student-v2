from django.db import models
from student.models import Student
from Admin.models import Admin 
# Create your models here.

class Score(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='scores')
    note = models.FloatField()
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='scores' , null=True, blank=True)  
    

    def __str__(self):
        return f"Score: {self.note} - {self.student.fullname}"

        

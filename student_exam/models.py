from django.db import models

# Create your models here.
from django.db import models
from student.models import Student  # Import from student app
from exam.models import Exam  # Import from exam app

class StudentExam(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    score = models.FloatField(null=True, blank=True)  # Optional field for scores
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp

    class Meta:
        unique_together = ('student', 'exam')  # Prevent duplicate entries

    def __str__(self):
        return f"{self.student} - {self.exam.name} ({self.score})"



    

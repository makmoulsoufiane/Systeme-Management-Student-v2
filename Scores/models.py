from django.db import models
from student.models import Student
from Teachers.models import Teacher  # Importing Teacher model for the relationship
from exam.models import exam  # Importing Exam model for the relationship
from Admin.models import Admin  # Importing Admin model for the relationship
from django.utils.timezone import now


class Score(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='scores')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name="scores_added")  # Teacher who added the score
    exam = models.ForeignKey(exam, on_delete=models.CASCADE, related_name='scores', null=True, blank=True)  # Exam related to the score
    admin = models.ForeignKey(Admin, on_delete=models.SET_NULL, null=True, related_name="approved_scores")  # Admin who approved or managed the score

    note = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True, null=True)  # To track when the score was created


    def __str__(self):
        return f"Score: {self.note} - {self.student.fullname} by {self.teacher.fullname if self.teacher else 'Unknown Teacher'}"
        
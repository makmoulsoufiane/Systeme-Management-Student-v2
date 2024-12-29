# Group/models.py
from django.db import models
from student.models import Student
from Admin.models import Admin



class Group(models.Model):
    id_group = models.AutoField(primary_key=True)
    year_of_creation = models.PositiveIntegerField()
    students = models.ManyToManyField(Student, related_name='groups')
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='groups')

    # علاقة Many-to-Many مع الطلاب (طالب يمكن أن ينتمي إلى عدة مجموعات)

    def __str__(self):
        return f"Group {self.id_group} - {self.year_of_creation}"

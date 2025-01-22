# Group/models.py
from django.db import models
from Teachers.models import Teacher
from Admin.models import Admin



class Group(models.Model):
    id_group = models.AutoField(primary_key=True)
    year_of_creation = models.PositiveIntegerField()
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='groups')
    teacher = models.OneToOneField(Teacher, on_delete=models.CASCADE, related_name='group')


    # علاقة Many-to-Many مع الطلاب (طالب يمكن أن ينتمي إلى عدة مجموعات)

    def __str__(self):
        return f"Group {self.id_group} - {self.year_of_creation}"

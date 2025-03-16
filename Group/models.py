# Group/models.py
from django.db import models
from Teachers.models import Teacher
from Admin.models import Admin



class Group(models.Model):
    id_group = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    year_of_creation = models.PositiveIntegerField()
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='groups')
    teacher = models.OneToOneField(Teacher, on_delete=models.CASCADE, related_name='group', null=True, default=None)


    

    def __str__(self):
        return f"Group {self.id_group} - {self.year_of_creation}"

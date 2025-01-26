# Group/models.py
from django.db import models
from Admin.models import Admin 

class Group(models.Model):
    id_group = models.AutoField(primary_key=True)
    year_of_creation = models.PositiveIntegerField()
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='Group')  

    def __str__(self):
        return f"Group {self.id_group} - {self.year_of_creation}"

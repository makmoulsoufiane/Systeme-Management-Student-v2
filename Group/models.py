# Group/models.py
from django.db import models

class Group(models.Model):
    id_group = models.AutoField(primary_key=True)
    year_of_creation = models.PositiveIntegerField()
    # علاقة Many-to-Many مع الطلاب (طالب يمكن أن ينتمي إلى عدة مجموعات)
    students = models.ManyToManyField('Student', related_name='groups')

    def __str__(self):
        return f"Group {self.id_group} - {self.year_of_creation}"

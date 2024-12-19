from django.db import models

# Create your models here.

class Exam(models.Model):
    id_exam = models.AutoField(primary_key=True) 
    date_of_inscription = models.DateField()
    place = models.CharField(max_length=50)
    name = models.CharField(max_length=255)

    class Meta:
        db_table = "Exam"
    
    
    def __str__(self):
        return self.name

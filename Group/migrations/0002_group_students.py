# Generated by Django 5.1.4 on 2024-12-29 12:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Group', '0001_initial'),
        ('student', '0002_alter_student_table'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='students',
            field=models.ManyToManyField(related_name='groups', to='student.student'),
        ),
    ]

# Generated by Django 5.1.4 on 2025-01-30 14:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Group', '0004_remove_group_students_group_teacher'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='name',
            field=models.CharField(default=1, max_length=100),
            preserve_default=False,
        ),
    ]

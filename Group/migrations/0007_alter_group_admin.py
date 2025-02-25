# Generated by Django 5.1.4 on 2025-02-23 22:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Admin', '0003_alter_admin_fullname'),
        ('Group', '0006_merge_0002_group_admin_0005_group_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='group',
            name='admin',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='groups', to='Admin.admin'),
        ),
    ]

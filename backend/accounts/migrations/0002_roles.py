from django.db import migrations, models
from django.db.models import Q


def assign_existing_admins(apps, schema_editor):
    user = apps.get_model('accounts', 'User')
    user.objects.using(schema_editor.connection.alias).filter(Q(is_staff=True) | Q(is_superuser=True)).update(role='admin', is_staff=True)


class Migration(migrations.Migration):
    dependencies = [('accounts', '0001_initial')]
    operations = [
        migrations.AddField(model_name='user', name='role', field=models.CharField(choices=[('admin', 'Admin'), ('teacher', 'Teacher'), ('student', 'Student')], default='student', max_length=10)),
        migrations.AddField(model_name='user', name='must_change_password', field=models.BooleanField(default=True)),
        migrations.AddField(model_name='user', name='token_version', field=models.PositiveIntegerField(default=0, editable=False)),
        migrations.RunPython(assign_existing_admins, migrations.RunPython.noop),
    ]

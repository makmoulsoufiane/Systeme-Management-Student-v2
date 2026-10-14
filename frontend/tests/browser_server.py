"""Disposable browser-test server. Never uses the configured school database."""
import os
from pathlib import Path
import sys
import tempfile
from datetime import date

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'backend'))
os.environ['DJANGO_SETTINGS_MODULE'] = 'sms.sqlite_settings'

with tempfile.TemporaryDirectory(prefix='campus-browser-') as temporary:
    os.environ['SMS_SQLITE_PATH'] = str(Path(temporary) / 'test.sqlite3')
    import django
    django.setup()
    from django.core.management import call_command
    from django.contrib.auth import get_user_model
    from Admin.models import Admin
    from Teachers.models import Teacher
    from Group.models import Group
    from student.models import Student

    call_command('migrate', run_syncdb=True, interactive=False, verbosity=0)
    get_user_model().objects.create_user(
        username='browser-staff', password='browser-tests-only',
        first_name='Alex', last_name='Morgan', is_staff=True,
    )
    admin = Admin.objects.create(fullname='School Office', address='Campus', date_of_inscription=date(2026, 1, 1))
    teacher = Teacher.objects.create(fullname='Amal Haddad', adress='Campus', date_of_inscription=date(2026, 1, 1), admin=admin)
    group = Group.objects.create(name='Science A', year_of_creation=2026, admin=admin, teacher=teacher)
    for name in ['Maya Benali', 'Adam Laurent', 'Lina Mansouri', 'Noah Williams', 'Sofia Chen', 'Youssef Amrani']:
        Student.objects.create(fullname=name, address='Campus residence', date_of_inscription=date(2026, 9, 1), admin=admin, group=group)
    call_command('runserver', '127.0.0.1:8001', use_reloader=False)

"""Exercise the auth.User adoption procedure on a disposable file database."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from django.test import SimpleTestCase


class UserMigrationTests(SimpleTestCase):
    def test_existing_users_passwords_memberships_and_log_entries_survive(self):
        backend = Path(__file__).resolve().parents[1]
        setup = '''
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'sms.sqlite_settings'
from django.conf import settings
settings.AUTH_USER_MODEL = 'auth.User'
import django
django.setup()
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.admin.models import LogEntry
call_command('migrate', 'auth', interactive=False, verbosity=0)
call_command('migrate', 'admin', interactive=False, verbosity=0)
user = get_user_model().objects.create_superuser('existing-admin', password='Preserved-password-837!')
user.groups.add(Group.objects.create(name='Existing group'))
LogEntry.objects.create(user=user, content_type=None, object_repr='Existing record', action_flag=1)
# The normal migration loader now sees accounts.0001 applied before switching.
call_command('migrate', 'accounts', '0001', interactive=False, verbosity=0)
'''
        verify = '''
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'sms.sqlite_settings'
import django
django.setup()
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.contrib.admin.models import LogEntry
call_command('migrate', interactive=False, verbosity=0)
user = get_user_model().objects.get(username='existing-admin')
assert user.pk == 1
assert user.role == 'admin'
assert user.must_change_password
assert user.check_password('Preserved-password-837!')
assert user.groups.get().name == 'Existing group'
assert LogEntry.objects.get().user_id == user.pk
call_command('makemigrations', check=True, dry_run=True, interactive=False, verbosity=0)
'''
        with tempfile.TemporaryDirectory(prefix='campus-migration-') as directory:
            environment = {**os.environ, 'SMS_SQLITE_PATH': str(Path(directory) / 'migration.sqlite3')}
            for script in (setup, verify):
                result = subprocess.run([sys.executable, '-c', script], cwd=backend, env=environment, text=True, capture_output=True, timeout=60)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

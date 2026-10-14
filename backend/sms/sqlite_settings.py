"""Opt-in SQLite sandbox using the current models, never the existing database.

Set SMS_SQLITE_PATH to a new disposable path when running a local server, then
use migrate --run-syncdb --settings=sms.sqlite_settings. This sandbox builds
application tables from current models independently of historical migrations.
"""

import os

from .settings import *  # noqa: F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.environ.get('SMS_SQLITE_PATH', ':memory:'),
    }
}
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']
MIGRATION_MODULES = {
    app: None for app in ('Admin', 'Teachers', 'Group', 'student', 'exam', 'Scores', 'student_exam')
}

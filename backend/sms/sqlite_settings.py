"""Opt-in SQLite sandbox, never the existing database.

Set SMS_SQLITE_PATH to a new disposable path when running a local server, then
use migrate --settings=sms.sqlite_settings. All migrations run normally.
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

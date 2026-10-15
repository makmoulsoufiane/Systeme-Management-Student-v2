"""One-time adoption of an existing auth_user table. Only migrate accounts 0001.

The User model is swapped out under these settings, so 0001 records migration
state without recreating the existing table. Switch back to normal settings for
0002 and subsequent migrations. See backend/accounts/README.md first.
"""
from .settings import *  # noqa: F403
AUTH_USER_MODEL = 'auth.User'

"""
WSGI config for skill_sync project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skill_sync.settings')

application = get_wsgi_application()

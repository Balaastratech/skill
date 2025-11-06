"""
ASGI config for skill_sync project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skill_sync.settings')

application = get_asgi_application()

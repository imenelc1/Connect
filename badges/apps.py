# dashboard/apps.py
from django.apps import AppConfig

class BadgeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'badges'

    def ready(self):
        import badges.signals

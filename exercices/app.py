from django.apps import AppConfig

class ExercicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'exercices'

    def ready(self):
        import exercices.signals

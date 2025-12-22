from django.contrib import admin

# Register your models here.
from .models import Exercice

@admin.register(Exercice)
class ExerciceAdmin(admin.ModelAdmin):
    list_display = ('titre_exo', 'niveau_exo', 'visibilite_exo', 'utilisateur', 'cours', 'enonce')
    search_fields = ('titre_exo',)
    list_filter = ('visibilite_exo', 'niveau_exo', 'utilisateur')


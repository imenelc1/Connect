from django.contrib import admin
from .models import ProgressionCours, TentativeExercice, Badge, GagnerBadge

# --- Badges ---
@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'description', 'condition', 'categorie', 'numpoints')
    search_fields = ('nom', 'condition', 'categorie')

@admin.register(GagnerBadge)
class GagnerBadgeAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'badge', 'date_obtention')
    search_fields = ('utilisateur__adresse_email', 'badge__nom')

# --- Progression des cours ---
@admin.register(ProgressionCours)
class ProgressionCoursAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'cours', 'avancement_cours', 'temps_passe')
    search_fields = ('utilisateur__adresse_email', 'cours__titre_cour')
    list_filter = ('cours',)

# --- Tentatives d'exercices ---
@admin.register(TentativeExercice)
class TentativeExerciceAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'exercice', 'date_soumission', 'etat', 'score', 'temps_passe', 'heure_tentative', 'feedback')
    search_fields = ('utilisateur__adresse_email', 'exercice__titre_exo')
    list_filter = ('etat',)

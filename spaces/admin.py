from django.contrib import admin
from .models import Space, SpaceEtudiant, SpaceCour, SpaceExo

@admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    list_display = ('id_space', 'nom_space', 'date_creation', 'utilisateur')
    search_fields = ('nom_space',)

@admin.register(SpaceEtudiant)
class SpaceEtudiantAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'space', 'date_ajout')
    list_filter = ('date_ajout', 'space')
    search_fields = ('etudiant__username', 'space__nom_space')

@admin.register(SpaceCour)
class SpaceCourAdmin(admin.ModelAdmin):
    list_display = ('space', 'cours', 'date_ajout')
    list_filter = ('space',)
    search_fields = ('cours__titre_cour', 'space__nom_space')

@admin.register(SpaceExo)
class SpaceExoAdmin(admin.ModelAdmin):
    list_display = ('space', 'exercice', 'date_ajout')
    list_filter = ('space',)
    search_fields = ('exercice__titre_exo', 'space__nom_space')

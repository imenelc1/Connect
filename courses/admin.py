from django.contrib import admin

# Register your models here.
from .models import Cours, Section, Lecon

@admin.register(Cours)
class CoursAdmin(admin.ModelAdmin):
    list_display = ('titre_cour', 'niveau_cour', 'visibilite_cour', 'utilisateur',  'description', 'duration')
    search_fields = ('titre_cour',)
    list_filter = ('visibilite_cour', 'niveau_cour', 'utilisateur')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('titre_section', 'cours', 'ordre')
    search_fields = ('titre_section',)
    list_filter = ('cours',)

@admin.register(Lecon)
class LeconAdmin(admin.ModelAdmin):
    list_display = ('titre_lecon', 'section', 'ordre', 'type_lecon')
    search_fields = ('titre_lecon',)
    list_filter = ('section', 'type_lecon')

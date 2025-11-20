from django.contrib import admin

# Register your models here.
from .models import Cours, Section, Lecon, Exercice, Quiz, Question, Option

@admin.register(Cours)
class CoursAdmin(admin.ModelAdmin):
    list_display = ('titre_cour', 'niveau_cour', 'visibilite_cour', 'utilisateur')
    search_fields = ('titre_cour',)
    list_filter = ('visibilite_cour', 'niveau_cour')

admin.site.register(Section)
admin.site.register(Lecon)
admin.site.register(Exercice)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Option)

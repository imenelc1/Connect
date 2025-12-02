from django.contrib import admin
from .models import Utilisateur, Etudiant, Enseignant, Administrateur

admin.site.register(Utilisateur)
admin.site.register(Etudiant)
admin.site.register(Enseignant)
admin.site.register(Administrateur)

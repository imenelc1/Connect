from django.db import models
from courses.models import Cours
from users.models import Utilisateur

class Exercice(models.Model):
    id_exercice = models.AutoField(primary_key=True)
    titre_exo = models.CharField(max_length=255)
    enonce = models.TextField()
    niveau_exo = models.CharField(max_length=50)
    visibilite_exo = models.BooleanField(default=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)
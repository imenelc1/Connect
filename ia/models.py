from courses import models
from Exercices.models import Exercice
from users.models import Utilisateur
from django.db import models

class Analyse(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    exercice = models.ForeignKey(Exercice, on_delete=models.CASCADE)
    explication_ia = models.TextField()
    date_analyse = models.DateField()

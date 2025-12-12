from django.db import models
from users.models import Utilisateur
from courses.models import Cours, Lecon
from exercices.models import Exercice

class LeconComplete(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    lecon = models.ForeignKey(Lecon, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('utilisateur', 'lecon')

class ProgressionCours(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)
    avancement_cours = models.FloatField()
    temps_passe = models.DurationField()

class TentativeExercice(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    exercice = models.ForeignKey(Exercice, on_delete=models.CASCADE)
    date_soumission = models.DateField()
    heure_tentative = models.TimeField()
    etat = models.CharField(max_length=50)
    score = models.FloatField()
    temps_passe = models.DurationField()
    reponse = models.TextField()
    feedback = models.TextField(blank=True, null=True)

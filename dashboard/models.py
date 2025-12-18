from datetime import timedelta
from django.db import models
from users.models import Utilisateur
from courses.models import Cours, Lecon
from Exercices.models import Exercice

class LeconComplete(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    lecon = models.ForeignKey(Lecon, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('utilisateur', 'lecon')

class ProgressionCours(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)
    avancement_cours = models.FloatField(null=False, default=0)
    temps_passe = models.DurationField(default=timedelta())
    derniere_lecon = models.ForeignKey(Lecon, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['utilisateur', 'cours'], name='unique_user_cours')
        ]



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

class SessionDuration(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    duration = models.IntegerField(default=0)  # durée en secondes
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.utilisateur.USERNAME_FIELD} - {self.duration}s"
    

# Historique pour dashboard / graphiques
class ProgressionHistory(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)

    avancement = models.FloatField()
    temps_passe = models.DurationField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
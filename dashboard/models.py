from datetime import timedelta
from django.db import models
from quiz.models import Quiz
from users.models import Utilisateur
from courses.models import Cours, Lecon
from exercices.models import Exercice
from datetime import timedelta

class LeconComplete(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    lecon = models.ForeignKey(Lecon, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('utilisateur', 'lecon')

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


from django.utils import timezone

class TentativeExercice(models.Model):
    ETAT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('soumis', 'Soumis'),
        ('corrige', 'Corrigé'),
    ]

    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    exercice = models.ForeignKey(Exercice, on_delete=models.CASCADE)

    reponse = models.TextField()
    output = models.TextField(null=True, blank=True)  # 👈 ICI

    etat = models.CharField(
        max_length=20,
        choices=ETAT_CHOICES,
        default='brouillon'
    )

    score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)

    temps_passe = models.DurationField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.etat == "soumis" and not self.submitted_at:
            self.submitted_at = timezone.now()
        super().save(*args, **kwargs)
    class Meta:
        ordering = ['-created_at'] 



class SessionDuration(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    duration = models.IntegerField(default=0)  # durée en secondes
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.utilisateur.USERNAME_FIELD} - {self.duration}s"
    

# Historique pour dashboard / graphiques
class ProgressionHistory(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE, null=True, blank=True)

    TYPE_CHOICES = [
        ("cours", "Cours"),
        ("quiz", "Quiz"),
    ]
    type_contenu = models.CharField(max_length=10, choices=TYPE_CHOICES, default="cours")

    quiz = models.ForeignKey("quiz.Quiz", on_delete=models.CASCADE, null=True, blank=True)

    avancement = models.FloatField()  # % de progression pour cours, score ou % pour quiz
    temps_passe = models.DurationField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


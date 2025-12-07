from django.db import models
from users.models import Utilisateur
from courses.models import Cours
from exercices.models import Exercice

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

class Analyse(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    exercice = models.ForeignKey(Exercice, on_delete=models.CASCADE)
    explication_ia = models.TextField()
    date_analyse = models.DateField()

class Badge(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField()
    icone = models.ImageField(upload_to='badges/', null=True, blank=True)
    condition = models.CharField(max_length=255)
    categorie = models.CharField(max_length=50, default="Général")
    numpoints = models.IntegerField(default=0)


    def __str__(self):
        return self.nom


class GagnerBadge(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    date_obtention = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('utilisateur', 'badge')  # un badge ne peut être gagné qu'une fois

    def __str__(self):
     return f"{self.utilisateur} earned {self.badge.nom}"

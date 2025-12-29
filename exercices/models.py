from django.db import models
from courses.models import Cours
from users.models import Utilisateur

class Exercice(models.Model):
    id_exercice = models.AutoField(primary_key=True)
    titre_exo = models.CharField(max_length=255)
    enonce = models.TextField()

    class Niveau(models.TextChoices):
        DEBUTANT = "debutant", "Débutant"
        INTERMEDIAIRE = "intermediaire", "Intermédiaire"
        AVANCE = "avance", "Avancé"

    niveau_exo = models.CharField(
        max_length=20,
        choices=Niveau.choices,
        default=Niveau.DEBUTANT
    )

    categorie = models.CharField(max_length=255, default="None")
    visibilite_exo = models.BooleanField(default=True)


    solution = models.TextField(null=True, blank=True)

    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)

    max_soumissions = models.PositiveIntegerField(
    default=0,  # 0 = illimité
    help_text="0 = illimité. Sinon, nombre maximum de soumissions par étudiant."
)


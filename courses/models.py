from django.db import models
from users.models import Utilisateur

STATUS_CHOICES = (
    ("draft", "Brouillon"),
    ("pending", "En attente"),
    ("approved", "Validé"),
    ("rejected", "Refusé"),
)

class Cours(models.Model):

    class Niveau(models.TextChoices):
        DEBUTANT = "debutant", "Débutant"
        INTERMEDIAIRE = "intermediaire", "Intermédiaire"
        AVANCE = "avance", "Avancé"

    id_cours = models.AutoField(primary_key=True)

    titre_cour = models.CharField(max_length=255)
    description = models.TextField()

    niveau_cour = models.CharField(
        max_length=20,
        choices=Niveau.choices,
        default=Niveau.DEBUTANT
    )

    duration = models.DurationField()

    visibilite_cour = models.BooleanField(default=True)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="draft"
    )

    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name="cours"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titre_cour


class Section(models.Model):
    id_section = models.AutoField(primary_key=True)
    cours = models.ForeignKey(Cours, related_name="sections", on_delete=models.CASCADE)
    titre_section = models.CharField(max_length=255)
    ordre = models.IntegerField()
    description = models.TextField(blank=True, null=True, default="")

class Lecon(models.Model):
    id_lecon = models.AutoField(primary_key=True)
    section = models.ForeignKey(Section, related_name="lecons", on_delete=models.CASCADE)
    titre_lecon = models.CharField(max_length=255)
    contenu_lecon = models.TextField()
    type_lecon = models.CharField(max_length=50)
    ordre = models.IntegerField()




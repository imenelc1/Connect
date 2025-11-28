from django.db import models
from users.models import Utilisateur

class Cours(models.Model):

    class Niveau(models.TextChoices):
        DEBUTANT = "debutant", "Débutant"
        INTERMEDIAIRE = "intermediaire", "Intermédiaire"
        AVANCE = "avance", "Avancé"

    id_cours = models.AutoField(primary_key=True)
    titre_cour = models.CharField(max_length=255)
    
    niveau_cour = models.CharField(
        max_length=20,
        choices=Niveau.choices,
        default=Niveau.DEBUTANT
    )

    visibilite_cour = models.BooleanField(default=True)
    description = models.TextField()
    duration = models.DurationField()

    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)

    def __str__(self):
        return self.titre_cour


class Section(models.Model):
    id_section = models.AutoField(primary_key=True)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)
    titre_section = models.CharField(max_length=255)
    ordre = models.IntegerField()

class Lecon(models.Model):
    id_lecon = models.AutoField(primary_key=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    titre_lecon = models.CharField(max_length=255)
    contenu_lecon = models.TextField()
    type_lecon = models.CharField(max_length=50)
    ordre = models.IntegerField()




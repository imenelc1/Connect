from django.db import models
from users.models import Utilisateur

class Cours(models.Model):
    id_cours = models.AutoField(primary_key=True)
    titre_cour = models.CharField(max_length=255)
    niveau_cour = models.CharField(max_length=50)
    contenu_cour = models.TextField()
    visibilite_cour = models.BooleanField(default=True)
    description = models.TextField()
    duration = models.DurationField()
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)

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

class Exercice(models.Model):
    id_exercice = models.AutoField(primary_key=True)
    titre_exo = models.CharField(max_length=255)
    enonce = models.TextField()
    niveau_exo = models.CharField(max_length=50)
    visibilite_exo = models.BooleanField(default=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)

class Quiz(models.Model):
    exercice = models.OneToOneField(Exercice, on_delete=models.CASCADE)

class Question(models.Model):
    id_qst = models.AutoField(primary_key=True)
    texte_qst = models.TextField()
    reponse_correcte = models.CharField(max_length=255)
    score = models.FloatField()
    exercice = models.ForeignKey(Exercice, on_delete=models.CASCADE)

class Option(models.Model):
    id_option = models.AutoField(primary_key=True)
    texte_option = models.CharField(max_length=255)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

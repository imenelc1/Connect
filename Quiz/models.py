from django.db import models
from Exercices.models import Exercice



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
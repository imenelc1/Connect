from django.db import models
from exercices.models import Exercice
from users.models import Utilisateur


class Quiz(models.Model):
    scoreMinimum=models.IntegerField()
    exercice = models.OneToOneField(Exercice, on_delete=models.CASCADE)
    activerDuration=models.BooleanField(default=True)
    duration=models.DurationField(null=True)
    nbMax_tentative=models.IntegerField(default=0)
    delai_entre_tentatives = models.PositiveIntegerField( default=0)

class Question(models.Model):
    id_qst = models.AutoField(primary_key=True)
    texte_qst = models.TextField()
    reponse_correcte = models.CharField(max_length=255)
    score = models.FloatField()
    exercice = models.ForeignKey(Exercice, related_name="questions" ,on_delete=models.CASCADE)

class Option(models.Model):
    id_option = models.AutoField(primary_key=True)
    texte_option = models.CharField(max_length=255)
    question = models.ForeignKey(Question, related_name="options", on_delete=models.CASCADE)
    
    
    """Reponse au quiz"""
class ReponseQuiz(models.Model):
    etudiant = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name="tentatives_quiz"
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="tentatives"
    )
    date_debut = models.DateTimeField(auto_now_add=True)
    date_fin = models.DateTimeField(null=True, blank=True)
    score_total = models.FloatField(default=0)
    terminer = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.etudiant} - {self.quiz}"


"""Reponse au question"""


class ReponseQuestion(models.Model):
    reponse_quiz = models.ForeignKey(
        ReponseQuiz,
        related_name="reponses",
        on_delete=models.CASCADE
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE
    )
    option_choisie = models.ForeignKey(
        Option,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    correct = models.BooleanField(null=True)
    score_obtenu = models.FloatField(default=0)

    def __str__(self):
        return f"Q: {self.question.id} - Correct: {self.correct}"

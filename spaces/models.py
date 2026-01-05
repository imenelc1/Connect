from django.db import models
from quiz.models import Quiz
from users.models import Utilisateur
from courses.models import Cours
from exercices.models import Exercice


# Modèle Space
class Space(models.Model):
    id_space = models.AutoField(primary_key=True)
    nom_space = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    def __str__(self):
        return self.nom_space


# Modèle SpaceEtudiant
class SpaceEtudiant(models.Model):
    date_ajout = models.DateTimeField(auto_now_add=True)
    etudiant = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    space = models.ForeignKey(Space, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('etudiant', 'space')  # un étudiant ne peut être qu'une fois dans un space

    def __str__(self):
        return f"{self.etudiant} dans {self.space}"



# Modèle SpaceCour
class SpaceCour(models.Model):
    date_ajout = models.DateTimeField(auto_now_add=True)
    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)
    ai_enabled = models.BooleanField(default=True)  # 👈 NOUVEAU

    class Meta:
        unique_together = ('space', 'cours') 

    def __str__(self):
        return f"{self.cours.titre_cour} dans {self.space.nom_space}"

# Modèle SpaceExo
class SpaceExo(models.Model):
    date_ajout = models.DateTimeField(auto_now_add=True)
    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    exercice = models.ForeignKey(Exercice, on_delete=models.CASCADE)
    ai_enabled = models.BooleanField(default=True)  # 👈 NOUVEAU

    class Meta:
        unique_together = ('space', 'exercice')  # un exercice ne peut être ajouté qu'une fois dans un space

    def __str__(self):
        return f"{self.exercice.titre_exo} dans {self.space.nom_space}"

class SpaceQuiz(models.Model):
    date_ajout = models.DateTimeField(auto_now_add=True)
    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('space', 'quiz')  # un quiz ne peut être ajouté qu'une fois dans un space

    def __str__(self):
        return f"{self.quiz.exercice.titre_exo} Quiz dans {self.space.nom_space}"



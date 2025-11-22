from django.db import models
from users.models import Utilisateur

class Forum(models.Model):
    id_forum = models.AutoField(primary_key=True)
    type = models.CharField(max_length=50)
    titre_forum = models.CharField(max_length=255)
    date_creation = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    id_message = models.AutoField(primary_key=True)
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    contenu_message = models.TextField()
    date_publication = models.DateTimeField(auto_now_add=True)

class Commentaire(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    date_commpub = models.DateField()
    heure_pub = models.TimeField()
    contenu_comm = models.TextField()

class Like(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
<<<<<<< HEAD
    date_liker = models.DateField()
=======
    date_liker = models.DateField()
>>>>>>> meriemi

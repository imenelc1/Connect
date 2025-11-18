from django.db import models
from users.models import Utilisateur

class Feedback(models.Model):
    id_feedback = models.AutoField(primary_key=True)
    contenu = models.TextField()
    etoile = models.IntegerField()
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)

class Notification(models.Model):
    id_notif = models.AutoField(primary_key=True)
    message_notif = models.TextField()
    date_envoie = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
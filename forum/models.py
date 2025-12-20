# forum/models.py
from django.db import models
from users.models import Utilisateur


# forum/models.py
class Forum(models.Model):
    id_forum = models.AutoField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=50)
    titre_forum = models.CharField(max_length=255)
    contenu_forum = models.TextField()  # NOUVEAU CHAMP
    date_creation = models.DateTimeField(auto_now_add=True)

    # NOUVEAU : définir la cible du forum
    CIBLE_CHOICES = (
        ('etudiants', 'Étudiants'),
        ('enseignants', 'Enseignants'),
    )
    cible = models.CharField(max_length=20, choices=CIBLE_CHOICES)

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.titre_forum} ({self.type})"



class Message(models.Model):
    id_message = models.AutoField(primary_key=True)
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='messages')
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    contenu_message = models.TextField()
    date_publication = models.DateTimeField(auto_now_add=True)
   
    class Meta:
        ordering = ['date_publication']
   
    def __str__(self):
        return f"Message {self.id_message} - {self.utilisateur.email[:20]}"


class MessageLike(models.Model):  # NOUVEAU MODÈLE
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='likes')
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    date_liker = models.DateTimeField(auto_now_add=True)
   
    class Meta:
        unique_together = ('message', 'utilisateur')
   
    def __str__(self):
        return f"MessageLike {self.id} - Message {self.message.id_message}"


class Commentaire(models.Model):
    id_commentaire = models.AutoField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='commentaires')
    date_commpub = models.DateTimeField(auto_now_add=True)
    contenu_comm = models.TextField()
   
    class Meta:
        ordering = ['date_commpub']
   
    def __str__(self):
        return f"Commentaire {self.id_commentaire} - {self.utilisateur.email[:20]}"


class Like(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='likes')
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    date_liker = models.DateTimeField(auto_now_add=True)
   
    class Meta:
        unique_together = ('forum', 'utilisateur')
   
    def __str__(self):
        return f"Like {self.id} - Forum {self.forum.id_forum}"
# forum/models.py
from django.db import models
from users.models import Utilisateur
from users.models import Administrateur


class Forum(models.Model):
    id_forum = models.AutoField(primary_key=True)
    
    # Créateur : soit utilisateur, soit admin
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, null=True, blank=True)
    administrateur = models.ForeignKey('users.Administrateur', on_delete=models.CASCADE, null=True, blank=True)
    
    type = models.CharField(max_length=50)
    titre_forum = models.CharField(max_length=255)
    contenu_forum = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)

    CIBLE_CHOICES = (
        ('etudiants', 'Étudiants'),
        ('enseignants', 'Enseignants'),
    )
    cible = models.CharField(max_length=20, choices=CIBLE_CHOICES)

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        if self.administrateur:
            return f"{self.titre_forum} (Admin: {self.administrateur.email_admin})"
        elif self.utilisateur:
            return f"{self.titre_forum} ({self.utilisateur.nom} {self.utilisateur.prenom})"
        return self.titre_forum




class Message(models.Model):
    id_message = models.AutoField(primary_key=True)
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='messages')
    
    # Auteur : utilisateur ou admin
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, null=True, blank=True)
    administrateur = models.ForeignKey(Administrateur, on_delete=models.CASCADE, null=True, blank=True)
    
    contenu_message = models.TextField()
    date_publication = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date_publication']

    def __str__(self):
        if self.administrateur:
            return f"Message {self.id_message} - Admin {self.administrateur.email_admin}"
        elif self.utilisateur:
            return f"Message {self.id_message} - {self.utilisateur.nom} {self.utilisateur.prenom}"
        return f"Message {self.id_message}"



class MessageLike(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='likes')
    
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, null=True, blank=True)
    administrateur = models.ForeignKey(Administrateur, on_delete=models.CASCADE, null=True, blank=True)
    
    date_liker = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['message', 'utilisateur'],
                name='unique_message_like_utilisateur'
            ),
            models.UniqueConstraint(
                fields=['message', 'administrateur'],
                name='unique_message_like_admin'
            )
        ]

    def __str__(self):
        if self.administrateur:
            return f"Like admin - Message {self.message.id_message}"
        return f"Like utilisateur - Message {self.message.id_message}"



class Commentaire(models.Model):
    id_commentaire = models.AutoField(primary_key=True)
    
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, null=True, blank=True)
    administrateur = models.ForeignKey(Administrateur, on_delete=models.CASCADE, null=True, blank=True)
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='commentaires')
    date_commpub = models.DateTimeField(auto_now_add=True)
    contenu_comm = models.TextField()

    class Meta:
        ordering = ['date_commpub']

    def __str__(self):
        if self.administrateur:
            return f"Commentaire {self.id_commentaire} - Admin {self.administrateur.email_admin}"
        return f"Commentaire {self.id_commentaire} - {self.utilisateur.nom} {self.utilisateur.prenom}"


class Like(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='likes')
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    date_liker = models.DateTimeField(auto_now_add=True)
   
    class Meta:
        unique_together = ('forum', 'utilisateur')
   
    def __str__(self):
        return f"Like {self.id} - Forum {self.forum.id_forum}"
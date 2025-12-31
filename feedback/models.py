# feedback/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from users.models import Utilisateur
from users.models import Utilisateur
from exercices.models import Exercice
from dashboard.models import TentativeExercice

class Feedback(models.Model):
    id_feedback = models.AutoField(primary_key=True)

    # Contenu du feedback
    contenu = models.TextField()
    etoile = models.PositiveSmallIntegerField()  # 1 à 5

    # Auteur
    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name="feedbacks"
    )
    afficher_nom = models.BooleanField(default=False)

    # ====== RELATION GÉNÉRIQUE ======
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE
    )
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "feedback"
        ordering = ["-date_creation"]
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]

    def __str__(self):
        return f"Feedback {self.id_feedback} ({self.etoile}★)"


class Notification(models.Model):
    id_notif = models.AutoField(primary_key=True)
    message_notif = models.TextField()
    date_envoie = models.DateTimeField(auto_now_add=True)
    
    # Destinataire utilisateur
    utilisateur_destinataire = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='notifications_recues',
        null=True,
        blank=True,
        db_column='utilisateur_destinataire_id'
    )

    # Destinataire admin
    admin_destinataire = models.ForeignKey(
        'users.Administrateur',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications_recues'
    )
    
    # Expéditeur (peut être nul)
    utilisateur_envoyeur = models.ForeignKey(
        Utilisateur,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications_envoyees',
        db_column='utilisateur_envoyeur_id'
    )
    
    # ====== CHAMPS GÉNÉRIQUES ======
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    action_type = models.CharField(max_length=50)
    module_source = models.CharField(max_length=50)
    is_read = models.BooleanField(default=False)
    extra_data = models.JSONField(null=True, blank=True, default=dict)
    
    class Meta:
        db_table = 'feedback_notification'
        ordering = ['-date_envoie']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['utilisateur_destinataire', 'is_read']),
            models.Index(fields=['admin_destinataire', 'is_read']),
        ]
    
    def __str__(self):
        target = self.admin_destinataire.email_admin if self.admin_destinataire else self.utilisateur_destinataire.adresse_email
        return f"Notification {self.id_notif} - {self.module_source}.{self.action_type} -> {target}"




class FeedbackExercice(models.Model):
    contenu = models.TextField()

    exercice = models.ForeignKey(
        Exercice,
        on_delete=models.CASCADE,
        related_name='feedbacks'
    )

    tentative = models.OneToOneField(
        TentativeExercice,
        on_delete=models.CASCADE,
        related_name='feedback_exercice'  # ✅ nom UNIQUE
    )

    auteur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='feedbacks_exercices'
    )

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        return f"Feedback de {self.auteur} sur {self.exercice.titre}"


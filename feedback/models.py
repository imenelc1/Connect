# feedback/models.py
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from users.models import Utilisateur


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
    nom_personnel = models.CharField(max_length=255, blank=True, null=True)
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
    
    # Qui reçoit la notification
    utilisateur_destinataire = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='notifications_recues',
        db_column='utilisateur_destinataire_id'
    )
    
    # Qui envoie (peut être nul pour notifications système)
    utilisateur_envoyeur = models.ForeignKey(
        Utilisateur,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications_envoyees',
        db_column='utilisateur_envoyeur_id'
    )
    
    # ====== CHAMPS GÉNÉRIQUES POUR TOUS LES TYPES ======
    
    # 1. Type de contenu (forum, cours, exercice, etc.)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # 2. ID de l'objet (forum_id, cours_id, etc.)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    
    # 3. L'objet lui-même (forum, cours, etc.)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # ====== AUTRES INFOS ======
    
    # Type d'action (like, comment, completed, ranked, etc.)
    action_type = models.CharField(max_length=50)  # 'forum_like', 'course_completed', etc.
    
    # Module source (forum, cours, exercice, classement, etc.)
    module_source = models.CharField(max_length=50)  # 'forum', 'cours', 'exercice', 'classement'
    
    # Lu ou non
    is_read = models.BooleanField(default=False)
    
    # Données supplémentaires (JSON)
    extra_data = models.JSONField(null=True, blank=True, default=dict)
    
    class Meta:
        db_table = 'feedback_notification'
        ordering = ['-date_envoie']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['utilisateur_destinataire', 'is_read']),
        ]
    
    def __str__(self):
        return f"Notification {self.id_notif} - {self.module_source}.{self.action_type}"
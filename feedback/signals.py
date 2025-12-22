from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from feedback.models import Feedback, Notification
from courses.models import Cours
from exercices.models import Exercice

@receiver(post_save, sender=Feedback)
def create_notification_on_feedback(sender, instance, created, **kwargs):
    if not created:
        return

    cible = instance.content_object
    utilisateur_source = instance.utilisateur

    destinataire = None
    module_source = ""
    message = ""

    # ====== FEEDBACK SUR UN COURS ======
    if isinstance(cible, Cours):
        destinataire = cible.utilisateur  # <- champ correct
        module_source = "cours"
        message = f"Un nouveau feedback ({instance.etoile}★) a été ajouté à votre cours '{cible.titre_cour}'."

    # ====== FEEDBACK SUR UN EXERCICE ======
    elif isinstance(cible, Exercice):
        destinataire = cible.createur  # ou adapte selon ton modèle Exercice
        module_source = "exercice"
        message = f"Un nouveau feedback ({instance.etoile}★) a été ajouté à votre exercice."

    # Vérifications supplémentaires
    if destinataire is None or destinataire == utilisateur_source:
        return
    
    if not hasattr(utilisateur_source, 'id_utilisateur'):
        return

    try:
        Notification.objects.create(
            message_notif=message,
            utilisateur_destinataire=destinataire,
            utilisateur_envoyeur=None,
            content_type=ContentType.objects.get_for_model(Feedback),
            object_id=instance.id_feedback,
            action_type="feedback_created",
            module_source=module_source,
            extra_data={
                "etoile": instance.etoile,
                "object_id": instance.object_id,
                "feedback_id": instance.id_feedback,
                "contenu_preview": instance.contenu[:100] if instance.contenu else "",
            }
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erreur création notification: {e}")

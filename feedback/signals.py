from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from feedback.models import Feedback
from users.models import Administrateur
from .utils import create_notification
from courses.models import Cours

@receiver(post_save, sender=Feedback)
def create_notification_on_feedback(sender, instance, created, **kwargs):
    if not created:
        return

    cible = instance.content_object
    if not isinstance(cible, Cours):
        return

    utilisateur_source = instance.utilisateur
    proprietaire_cours = cible.utilisateur

    # Notification pour le propriétaire du cours
    if proprietaire_cours != utilisateur_source:
        create_notification(
            destinataire=proprietaire_cours,
            envoyeur=utilisateur_source if getattr(instance, "afficher_nom", False) else None,
            content_object=instance,
            action_type="feedback_created",
            module_source="cours",
            message=f"Nouveau feedback ({instance.etoile}★) sur votre cours '{cible.titre_cour}'.",
            extra_data={
                "feedback_id": instance.id_feedback,
                "etoile": instance.etoile,
                "cours_id": cible.id_cours,
                "afficher_nom": getattr(instance, "afficher_nom", False)
            }
        )

    # Notification pour tous les admins
    for admin in Administrateur.objects.all():
        create_notification(
            admin_destinataire=admin,
            envoyeur=utilisateur_source if getattr(instance, "afficher_nom", False) else None,
            content_object=instance,
            action_type="feedback_created",
            module_source="cours",
            message=f"Nouveau feedback ({instance.etoile}★) sur le cours '{cible.titre_cour}'.",
            extra_data={
                "feedback_id": instance.id_feedback,
                "etoile": instance.etoile,
                "cours_id": cible.id_cours,
                "afficher_nom": getattr(instance, "afficher_nom", False)
            }
        )

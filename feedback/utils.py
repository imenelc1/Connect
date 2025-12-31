from django.contrib.contenttypes.models import ContentType
from .models import Notification
from users.models import Utilisateur, Administrateur

def create_notification(
    destinataire: Utilisateur = None,
    admin_destinataire: Administrateur = None,
    envoyeur: Utilisateur = None,
    content_object=None,
    action_type: str = '',
    module_source: str = '',
    message: str = '',
    extra_data: dict = None
):
    """
    Crée une notification pour un Utilisateur ou un Admin.
    """
    # Empêche de s'envoyer une notification à soi-même
    if destinataire and envoyeur and destinataire.id_utilisateur == envoyeur.id_utilisateur:
        return None

    notif = Notification(
        utilisateur_destinataire=destinataire,
        admin_destinataire=admin_destinataire,
        utilisateur_envoyeur=envoyeur,
        message_notif=message,
        action_type=action_type,
        module_source=module_source,
        extra_data=extra_data or {}
    )

    # Lier l'objet (cours, feedback, etc.)
    if content_object:
        notif.content_type = ContentType.objects.get_for_model(content_object)
        notif.object_id = content_object.pk

    notif.save()
    return notif

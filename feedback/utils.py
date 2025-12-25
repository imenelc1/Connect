# feedback/utils.py
from django.contrib.contenttypes.models import ContentType
from .models import Notification

def create_notification(
    destinataire,
    envoyeur=None,
    content_object=None,
    action_type='',
    module_source='',
    message='',
    extra_data=None
):
    """
    Crée une notification pour n'importe quel type de contenu
    """
    # Évite les notifications à soi-même
    if envoyeur and envoyeur.id_utilisateur == destinataire.id_utilisateur:
        return None
    
    notification = Notification(
        utilisateur_destinataire=destinataire,
        utilisateur_envoyeur=envoyeur,
        message_notif=message,
        action_type=action_type,
        module_source=module_source,
        extra_data=extra_data or {}
    )
    
    if content_object:
        notification.content_type = ContentType.objects.get_for_model(content_object)
        notification.object_id = content_object.pk
    
    notification.save()
    print(f"✅ Notification créée: {destinataire.email} - {module_source}.{action_type}")
    return notification
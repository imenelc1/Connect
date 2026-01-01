from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Utilisateur, Administrateur
from feedback.models import Notification

@receiver(post_save, sender=Utilisateur)
def notify_admins_on_user_registration(sender, instance, created, **kwargs):
    if not created:
        return

    user = instance

    # Déterminer le rôle
    if hasattr(user, "etudiant"):
        role = "Étudiant"
    elif hasattr(user, "enseignant"):
        role = "Enseignant"
    else:
        role = "Utilisateur"

    content_type = ContentType.objects.get_for_model(Utilisateur)

    notifications = []
    admins = Administrateur.objects.all()

    for admin in admins:
        notifications.append(
            Notification(
                admin_destinataire=admin,
                utilisateur_envoyeur=user,
                message_notif=(
                    f"Nouvelle inscription : {user.nom} {user.prenom} "
                    f"({role})"
                ),
                content_type=content_type,
                object_id=user.id_utilisateur,
                action_type="user_registered",
                module_source="users",
                extra_data={
                    "role": role.lower(),
                    "email": user.adresse_email
                }
            )
        )

    Notification.objects.bulk_create(notifications)

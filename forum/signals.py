# forum/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Like, Commentaire, MessageLike, Message, Forum
from feedback.utils import create_notification
from users.models import Utilisateur, Administrateur


# =========================
# 🔧 UTILITAIRE ADMIN
# =========================
def notify_admins(message, content_object, action_type, module_source, envoyeur=None):
    admins = Administrateur.objects.all()
    if isinstance(envoyeur, Administrateur):
        # Exclure l'admin qui a envoyé l'action
        admins = admins.exclude(id_admin=envoyeur.id_admin)
    for admin in admins:
        create_notification(
            admin_destinataire=admin,
            envoyeur=envoyeur,
            content_object=content_object,
            action_type=action_type,
            module_source=module_source,
            message=message
        )




# =========================
# 🔔 LIKE FORUM
# =========================
@receiver(post_save, sender=Like)
def notify_forum_like(sender, instance, created, **kwargs):
    if not created:
        return

    forum = instance.forum
    user = getattr(instance, 'utilisateur', None)
    admin = getattr(instance, 'administrateur', None)

    if user:
        # Si c'est un utilisateur normal
        if forum.utilisateur and forum.utilisateur != user:
            create_notification(
                destinataire=forum.utilisateur,
                envoyeur=user,
                content_object=forum,
                action_type="like",
                module_source="forum",
                message=f"{user.prenom} a aimé votre forum « {forum.titre_forum[:50]} »."
            )

        # Notification pour tous les admins
        notify_admins(
            message=f"{user.prenom} a aimé le forum « {forum.titre_forum[:50]} ».",
            content_object=forum,
            action_type="forum_like",
            module_source="forum",
            envoyeur=user
        )

    elif admin:
        # Si c'est un admin qui like, on ne notifie pas l'auteur
        # Juste une notification générale ou rien selon ton besoin
        create_notification(
            destinataire=forum.utilisateur,
            envoyeur=None,
            content_object=forum,
            action_type="forum_like",
            module_source="forum",
            message="Un Administrateur a aimé votre forum."
        )

        # Notification pour tous les admins si tu veux
        notify_admins(
            message=f"L'administrateur {admin.email_admin} a aimé le forum « {forum.titre_forum[:50]} ».",
            content_object=forum,
            action_type="forum_like",
            module_source="forum",
            envoyeur=admin
        )


# =========================
# 🔔 COMMENTAIRE SUR MESSAGE
# =========================
@receiver(post_save, sender=Commentaire)
def notify_comment(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance.message
    user = instance.utilisateur

    if not message.utilisateur or message.utilisateur == user:
        return

    # Auteur du message
    create_notification(
        destinataire=message.utilisateur,
        envoyeur=user,
        content_object=message,
        action_type="comment",
        module_source="forum",
        message=(
            f"{user.prenom} a commenté votre message dans le forum "
            f"« {message.forum.titre_forum[:30]} »."
        )
    )

    # Admin
    notify_admins(
        message=(
            f"{user.prenom} a commenté un message dans le forum "
            f"« {message.forum.titre_forum[:30]} »."
        ),
        content_object=message,
        action_type="comment_added",
        module_source="forum",
        envoyeur=user
    )


# =========================
# 🔔 LIKE MESSAGE
# =========================
@receiver(post_save, sender=MessageLike)
def notify_message_like(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance.message
    user = instance.utilisateur

    if not message.utilisateur or message.utilisateur == user:
        return

    # Auteur du message
    create_notification(
        destinataire=message.utilisateur,
        envoyeur=user,
        content_object=message,
        action_type="message_like",
        module_source="forum",
        message=(
            f"{user.prenom} a aimé votre message dans le forum "
            f"« {message.forum.titre_forum[:30]} »."
        )
    )

    # Admin
    notify_admins(
        message=(
            f"{user.prenom} a aimé un message dans le forum "
            f"« {message.forum.titre_forum[:30]} »."
        ),
        content_object=message,
        action_type="message_like",
        module_source="forum",
        envoyeur=user
    )


# =========================
# 🔔 NOUVEAU MESSAGE
# =========================
@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance
    forum = message.forum
    sender_user = message.utilisateur

    if not forum or not sender_user:
        return

    forum_cible = getattr(forum, "cible", None)

    if forum_cible == "etudiants":
        participants = Utilisateur.objects.filter(etudiant__isnull=False)
    elif forum_cible == "enseignants":
        participants = Utilisateur.objects.filter(enseignant__isnull=False)
    else:
        participants = Utilisateur.objects.all()

    participants = participants.exclude(id_utilisateur=sender_user.id_utilisateur)

    # inclure les anciens participants
    previous_posters = Message.objects.filter(forum=forum)\
        .exclude(utilisateur=sender_user)\
        .values_list("utilisateur_id", flat=True)

    participants = participants | Utilisateur.objects.filter(id_utilisateur__in=previous_posters)

    for user in participants.distinct():
        create_notification(
            destinataire=user,
            envoyeur=sender_user,
            content_object=forum,
            action_type="new_message",
            module_source="forum",
            message=f"{sender_user.prenom} a posté un message dans « {forum.titre_forum[:50]} »."
        )

    # Admin
    notify_admins(
        message=f"Nouveau message posté par {sender_user.prenom} dans le forum « {forum.titre_forum[:50]} ».",
        content_object=forum,
        action_type="new_message",
        module_source="forum",
        envoyeur=sender_user
    )


# =========================
# 🔔 NOUVEAU FORUM
# =========================
@receiver(post_save, sender=Forum)
def notify_new_forum(sender, instance, created, **kwargs):
    if not created:
        return

    forum = instance
    creator = forum.utilisateur
    if not creator:
        return

    forum_cible = getattr(forum, "cible", None)

    if forum_cible == "etudiants":
        destinataires = Utilisateur.objects.filter(etudiant__isnull=False)
    elif forum_cible == "enseignants":
        destinataires = Utilisateur.objects.filter(enseignant__isnull=False)
    else:
        destinataires = Utilisateur.objects.all()

    destinataires = destinataires.exclude(id_utilisateur=creator.id_utilisateur)

    for user in destinataires:
        create_notification(
            destinataire=user,
            envoyeur=creator,
            content_object=forum,
            action_type="new_forum",
            module_source="forum",
            message=f"{creator.prenom} a créé un nouveau forum « {forum.titre_forum[:50]} »."
        )

    # Admin
    notify_admins(
        message=f"Nouveau forum créé par {creator.prenom} : « {forum.titre_forum[:50]} ».",
        content_object=forum,
        action_type="forum_created",
        module_source="forum",
        envoyeur=creator
    )

# forum/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Like, Commentaire, MessageLike, Message, Forum
from feedback.utils import create_notification
from users.models import Utilisateur
from feedback.utils import create_notification

def get_user_role(user):
    """Retourne le rôle d'un utilisateur : 'etudiant', 'enseignant' ou None."""
    if hasattr(user, 'etudiant'):
        return 'etudiant'
    elif hasattr(user, 'enseignant'):
        return 'enseignant'
    else:
        return None
# 🔔 LIKE FORUM
@receiver(post_save, sender=Like)
def notify_forum_like(sender, instance, created, **kwargs):
    if not created:
        return

    forum = instance.forum
    user = instance.utilisateur

    if not forum.utilisateur or forum.utilisateur == user:
        return

    try:
        create_notification(
            destinataire=forum.utilisateur,
            envoyeur=user,
            content_object=forum,
            action_type='like',
            module_source='forum',
            message=f"{user.prenom} a aimé votre forum '{forum.titre_forum[:50]}...'"
        )
    except Exception as e:
        print(f"Erreur notification like forum: {e}")


# 🔔 COMMENTAIRE SUR MESSAGE
@receiver(post_save, sender=Commentaire)
def notify_comment(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance.message
    user = instance.utilisateur

    if not message.utilisateur or message.utilisateur == user:
        return

    try:
        create_notification(
            destinataire=message.utilisateur,
            envoyeur=user,
            content_object=message,
            action_type='comment',
            module_source='forum',
            message=f"{user.prenom} a commenté votre message dans le forum "
                    f"'{message.forum.titre_forum[:30]}...'"
        )
    except Exception as e:
        print(f"Erreur notification commentaire: {e}")


# 🔔 LIKE MESSAGE
@receiver(post_save, sender=MessageLike)
def notify_message_like(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance.message
    user = instance.utilisateur

    if not message.utilisateur or message.utilisateur == user:
        return

    try:
        create_notification(
            destinataire=message.utilisateur,
            envoyeur=user,
            content_object=message,
            action_type='message_like',
            module_source='forum',
            message=f"{user.prenom} a aimé votre message dans le forum "
                    f"'{message.forum.titre_forum[:30]}...'"
        )
    except Exception as e:
        print(f"Erreur notification like message: {e}")


@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance
    forum = message.forum
    sender_user = message.utilisateur

    if not forum or not sender_user:
        return

    forum_type = forum.type  # type envoyé depuis le front-end

    # Déterminer le groupe de participants à notifier selon le type
    if forum_type in ["teacher-student", "student-student"]:
        # Notifier les étudiants
        participants = Utilisateur.objects.filter(etudiant__isnull=False).exclude(id_utilisateur=sender_user.id_utilisateur)
    elif forum_type in ["student-teacher", "teacher-teacher"]:
        # Notifier les enseignants
        participants = Utilisateur.objects.filter(enseignant__isnull=False).exclude(id_utilisateur=sender_user.id_utilisateur)
    else:
        # fallback : tous sauf l'auteur
        participants = Utilisateur.objects.exclude(id_utilisateur=sender_user.id_utilisateur)

    # Si tu veux notifier aussi les participants ayant déjà posté un message, tu peux fusionner :
    previous_posters = set(
        Message.objects.filter(forum=forum)
        .exclude(utilisateur=sender_user)
        .values_list('utilisateur_id', flat=True)
    )
    participants = participants | Utilisateur.objects.filter(id_utilisateur__in=previous_posters)

    # Envoyer les notifications
    for user in participants:
        try:
            create_notification(
                destinataire=user,
                envoyeur=sender_user,
                content_object=forum,
                action_type='new_message',
                module_source='forum',
                message=f"{sender_user.prenom} a posté un message dans '{forum.titre_forum[:50]}...'"
            )
        except Exception as e:
            print(f"Erreur notification pour {user.adresse_email}: {e}")





@receiver(post_save, sender=Forum)
def notify_new_forum(sender, instance, created, **kwargs):
    if not created:
        return

    forum = instance
    creator = forum.utilisateur
    if not creator:
        return

    # Déterminer les destinataires selon le type du forum
    forum_type = forum.type  # ex: "teacher-student", "student-teacher", "teacher-teacher", "student-student"

    if forum_type in ["teacher-student", "student-student"]:
        # Notifier uniquement les étudiants
        destinataires = Utilisateur.objects.filter(etudiant__isnull=False).exclude(id_utilisateur=creator.id_utilisateur)
    elif forum_type in ["student-teacher", "teacher-teacher"]:
        # Notifier uniquement les enseignants
        destinataires = Utilisateur.objects.filter(enseignant__isnull=False).exclude(id_utilisateur=creator.id_utilisateur)
    else:
        # fallback : tous sauf le créateur
        destinataires = Utilisateur.objects.exclude(id_utilisateur=creator.id_utilisateur)

    for user in destinataires:
        try:
            create_notification(
                destinataire=user,
                envoyeur=creator,
                content_object=forum,
                action_type='new_forum',
                module_source='forum',
                message=f"{creator.prenom} a créé un nouveau forum : '{forum.titre_forum[:50]}...'"
            )
        except Exception as e:
            print(f"Erreur notification pour {user.adresse_email}: {e}")

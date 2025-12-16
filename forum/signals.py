# forum/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from django.db.models import Q
from .models import Like, Commentaire, MessageLike, Message, Forum
from feedback.utils import create_notification

# 🔔 LIKE FORUM
@receiver(post_save, sender=Like)
def notify_forum_like(sender, instance, created, **kwargs):
    if not created:
        return

    forum = instance.forum
    user = instance.utilisateur
    
    # Ne pas notifier si l'utilisateur like son propre forum
    if not forum.utilisateur or forum.utilisateur.id == user.id:
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
        print(f"Erreur lors de la création de notification pour like forum: {e}")

# 🔔 COMMENTAIRE SUR MESSAGE
@receiver(post_save, sender=Commentaire)
def notify_comment(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance.message
    user = instance.utilisateur
    
    # Ne pas notifier si l'utilisateur commente son propre message
    if not message.utilisateur or message.utilisateur.id == user.id:
        return
    
    try:
        create_notification(
            destinataire=message.utilisateur,
            envoyeur=user,
            content_object=message,
            action_type='comment',
            module_source='forum',
            message=f"{user.prenom} a commenté votre message dans le forum '{message.forum.titre_forum[:30]}...'"
        )
    except Exception as e:
        print(f"Erreur lors de la création de notification pour commentaire: {e}")

# 🔔 LIKE MESSAGE
@receiver(post_save, sender=MessageLike)
def notify_message_like(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance.message
    user = instance.utilisateur
    
    # Ne pas notifier si l'utilisateur like son propre message
    if not message.utilisateur or message.utilisateur.id == user.id:
        return
    
    try:
        create_notification(
            destinataire=message.utilisateur,
            envoyeur=user,
            content_object=message,
            action_type='message_like',
            module_source='forum',
            message=f"{user.prenom} a aimé votre message dans le forum '{message.forum.titre_forum[:30]}...'"
        )
    except Exception as e:
        print(f"Erreur lors de la création de notification pour like message: {e}")

# 🔔 NOUVEAU MESSAGE DANS UN FORUM
@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance
    forum = message.forum
    sender_user = message.utilisateur
    
    # Ne pas traiter si le forum n'existe plus ou si pas d'auteur
    if not forum or not sender_user:
        return

    # Ensemble pour éviter les doublons
    participants = set()

    # 🔹 Tous les utilisateurs qui ont déjà écrit dans le forum
    existing_participants = Message.objects.filter(
        forum=forum
    ).exclude(
        utilisateur=sender_user
    ).values_list('utilisateur_id', flat=True).distinct()
    
    participants.update(existing_participants)

    # 🔹 Ajouter le créateur du forum s'il existe et n'est pas l'auteur
    if forum.utilisateur and forum.utilisateur.id != sender_user.id:
        participants.add(forum.utilisateur.id)

    # 🔹 Ajouter tous les utilisateurs qui ont liké le forum (optionnel)
    # forum_likers = Like.objects.filter(forum=forum).exclude(utilisateur=sender_user).values_list('utilisateur_id', flat=True).distinct()
    # participants.update(forum_likers)

    # 🔔 Créer une notification pour chaque participant unique
    for user_id in participants:
        try:
            create_notification(
                destinataire_id=user_id,
                envoyeur=sender_user,
                content_object=forum,
                action_type='new_message',
                module_source='forum',
                message=f"{sender_user.prenom} a posté un message dans '{forum.titre_forum[:50]}...'"
            )
        except Exception as e:
            print(f"Erreur lors de la création de notification pour user_id {user_id}: {e}")

# 🔔 NOUVEAU FORUM (Optionnel - si vous voulez notifier des utilisateurs spécifiques)
@receiver(post_save, sender=Forum)
def notify_new_forum(sender, instance, created, **kwargs):
    if not created:
        return
    
    forum = instance
    creator = forum.utilisateur
    
    if not creator:
        return
    
    # Ici vous pourriez notifier certains groupes d'utilisateurs
    # Par exemple, tous les enseignants quand un étudiant crée un forum
    # ou tous les étudiants quand un enseignant crée un forum
    
    # Exemple: Notifier tous les enseignants quand un étudiant crée un forum
    # from django.contrib.auth.models import User
    # if creator.role == 'etudiant':
    #     enseignants = User.objects.filter(profile__role='enseignant')
    #     for enseignant in enseignants:
    #         create_notification(...)
    
    pass
# forum/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Forum, Message, Commentaire, Like, MessageLike
from feedback.utils import create_notification
from users.models import Utilisateur, Administrateur


# =========================
# 🔧 UTILITAIRE ADMIN
# =========================
def notify_admins(message, content_object, action_type, module_source, envoyeur=None):
    """Notifie tous les administrateurs sauf l'envoyeur"""
    admins = Administrateur.objects.all()
    if isinstance(envoyeur, Administrateur):
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


def notify_target_users(forum, message, action_type, envoyeur, specific_action=None):
    """Notifie les utilisateurs ciblés par un forum quand quelqu'un interagit"""
    forum_cible = getattr(forum, "cible", None)
    
    if forum_cible == "etudiants":
        destinataires = Utilisateur.objects.filter(etudiant__isnull=False)
        target_label = "étudiants"
    elif forum_cible == "enseignants":
        destinataires = Utilisateur.objects.filter(enseignant__isnull=False)
        target_label = "enseignants"
    else:
        destinataires = Utilisateur.objects.all()
        target_label = "tous"
    
    # Exclure l'envoyeur s'il est un utilisateur
    if isinstance(envoyeur, Utilisateur):
        destinataires = destinataires.exclude(id_utilisateur=envoyeur.id_utilisateur)
    
    # Exclure les utilisateurs qui ont déjà interagi dans ce forum (posté un message)
    participants = Message.objects.filter(forum=forum).values_list("utilisateur_id", flat=True)
    non_participants = destinataires.exclude(id_utilisateur__in=participants)
    
    # Pour les non-participants, notifier l'activité
    for user in non_participants.distinct():
        create_notification(
            destinataire=user,
            envoyeur=envoyeur,
            content_object=forum,
            action_type=action_type,
            module_source="forum",
            message=message
        )


# =========================
# 🔔 NOUVEAU FORUM (COMPLET)
# =========================
@receiver(post_save, sender=Forum)
def notify_new_forum(sender, instance, created, **kwargs):
    if not created:
        return

    forum = instance
    creator = forum.utilisateur
    admin_creator = forum.administrateur
    forum_cible = getattr(forum, "cible", None)
    titre_forum = forum.titre_forum[:50]

    # FORUM CRÉÉ PAR UN ADMINISTRATEUR
    if admin_creator and not creator:
        if forum_cible == "etudiants":
            destinataires = Utilisateur.objects.filter(etudiant__isnull=False)
            target_label = "étudiants"
        elif forum_cible == "enseignants":
            destinataires = Utilisateur.objects.filter(enseignant__isnull=False)
            target_label = "enseignants"
        else:
            destinataires = Utilisateur.objects.none()
            target_label = "tous"

        # Notifier les utilisateurs ciblés
        for utilisateur in destinataires:
            create_notification(
                destinataire=utilisateur,
                envoyeur=None,
                content_object=forum,
                action_type="new_forum_by_admin",
                module_source="forum",
                message=f"📢 L'administrateur a créé un nouveau forum pour les {target_label} : « {titre_forum} »"
            )

        # Notifier les autres administrateurs
        other_admins = Administrateur.objects.exclude(id_admin=admin_creator.id_admin)
        for admin in other_admins:
            create_notification(
                admin_destinataire=admin,
                envoyeur=admin_creator,
                content_object=forum,
                action_type="admin_forum_created",
                module_source="forum",
                message=f"📢 {admin_creator.email_admin} a créé un forum pour les {target_label} : « {titre_forum} »"
            )

    # FORUM CRÉÉ PAR UN UTILISATEUR NORMAL
    elif creator and not admin_creator:
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
                message=f"{creator.prenom} a créé un nouveau forum : « {titre_forum} »"
            )

        notify_admins(
            message=f"Nouveau forum créé par {creator.prenom} : « {titre_forum} »",
            content_object=forum,
            action_type="forum_created",
            module_source="forum",
            envoyeur=creator
        )


# =========================
# 🔔 LIKE FORUM (AVEC ADMIN)
# =========================
@receiver(post_save, sender=Like)
def notify_forum_like(sender, instance, created, **kwargs):
    if not created:
        return

    forum = instance.forum
    user = getattr(instance, 'utilisateur', None)
    admin = getattr(instance, 'administrateur', None)
    titre_forum = forum.titre_forum[:50]

    # ADMIN AIME UN FORUM
    if admin:
        # 1. Notifier l'auteur du forum (s'il existe et n'est pas admin)
        if forum.utilisateur:
            create_notification(
                destinataire=forum.utilisateur,
                envoyeur=None,
                content_object=forum,
                action_type="admin_forum_like",
                module_source="forum",
                message=f"👑 L'administrateur a aimé votre forum : « {titre_forum} »"
            )
        
        # 2. Notifier les utilisateurs ciblés par le forum
        forum_cible = getattr(forum, "cible", None)
        if forum_cible in ["etudiants", "enseignants"]:
            if forum_cible == "etudiants":
                destinataires = Utilisateur.objects.filter(etudiant__isnull=False)
            else:
                destinataires = Utilisateur.objects.filter(enseignant__isnull=False)
            
            # Exclure l'auteur du forum s'il existe
            if forum.utilisateur:
                destinataires = destinataires.exclude(id_utilisateur=forum.utilisateur.id_utilisateur)
            
            for user_target in destinataires.distinct()[:20]:  # Limiter à 20 notifications
                create_notification(
                    destinataire=user_target,
                    envoyeur=None,
                    content_object=forum,
                    action_type="forum_trending",
                    module_source="forum",
                    message=f"🔥 L'administrateur a aimé le forum « {titre_forum} » (dédié aux {forum_cible})"
                )
        
        # 3. Notifier les autres admins
        other_admins = Administrateur.objects.exclude(id_admin=admin.id_admin)
        for other_admin in other_admins:
            create_notification(
                admin_destinataire=other_admin,
                envoyeur=admin,
                content_object=forum,
                action_type="admin_forum_interaction",
                module_source="forum",
                message=f"👑 {admin.email_admin} a aimé le forum : « {titre_forum} »"
            )

    # UTILISATEUR NORMAL AIME UN FORUM
    elif user:
        # Notifier l'auteur du forum (s'il existe et n'est pas l'utilisateur)
        if forum.utilisateur and forum.utilisateur != user:
            create_notification(
                destinataire=forum.utilisateur,
                envoyeur=user,
                content_object=forum,
                action_type="forum_like",
                module_source="forum",
                message=f"{user.prenom} a aimé votre forum : « {titre_forum} »"
            )
        
        # Notifier les admins
        notify_admins(
            message=f"{user.prenom} a aimé le forum : « {titre_forum} »",
            content_object=forum,
            action_type="forum_like",
            module_source="forum",
            envoyeur=user
        )


# =========================
# 🔔 NOUVEAU MESSAGE (AVEC ADMIN)
# =========================
@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance
    forum = message.forum
    sender_user = message.utilisateur
    admin_sender = message.administrateur
    titre_forum = forum.titre_forum[:50]
    
    # Préparer le contenu tronqué du message
    message_preview = message.contenu_message[:100]
    if len(message.contenu_message) > 100:
        message_preview += "..."

    # MESSAGE POSTÉ PAR UN ADMIN
    if admin_sender and not sender_user:
        # 1. Notifier tous les utilisateurs ciblés par le forum
        forum_cible = getattr(forum, "cible", None)
        if forum_cible == "etudiants":
            destinataires = Utilisateur.objects.filter(etudiant__isnull=False)
            target_label = "étudiants"
        elif forum_cible == "enseignants":
            destinataires = Utilisateur.objects.filter(enseignant__isnull=False)
            target_label = "enseignants"
        else:
            destinataires = Utilisateur.objects.all()
            target_label = "tous"
        
        for user in destinataires.distinct()[:30]:  # Limiter à 30 notifications
            create_notification(
                destinataire=user,
                envoyeur=None,
                content_object=forum,
                action_type="admin_message",
                module_source="forum",
                message=f"📢 L'administrateur a posté un message dans « {titre_forum} » : {message_preview}"
            )
        
        # 2. Notifier les autres admins
        other_admins = Administrateur.objects.exclude(id_admin=admin_sender.id_admin)
        for admin in other_admins:
            create_notification(
                admin_destinataire=admin,
                envoyeur=admin_sender,
                content_object=forum,
                action_type="admin_message_posted",
                module_source="forum",
                message=f"📢 {admin_sender.email_admin} a posté dans le forum « {titre_forum} »"
            )
        
        # 3. Notifier l'auteur du forum s'il existe et n'est pas admin
        if forum.utilisateur:
            create_notification(
                destinataire=forum.utilisateur,
                envoyeur=None,
                content_object=forum,
                action_type="admin_message_in_your_forum",
                module_source="forum",
                message=f"📢 L'administrateur a répondu dans votre forum « {titre_forum} »"
            )

    # MESSAGE POSTÉ PAR UN UTILISATEUR NORMAL
    elif sender_user and not admin_sender:
        # Logique existante pour les utilisateurs normaux
        forum_cible = getattr(forum, "cible", None)
        
        if forum_cible == "etudiants":
            participants = Utilisateur.objects.filter(etudiant__isnull=False)
        elif forum_cible == "enseignants":
            participants = Utilisateur.objects.filter(enseignant__isnull=False)
        else:
            participants = Utilisateur.objects.all()

        participants = participants.exclude(id_utilisateur=sender_user.id_utilisateur)

        # Inclure les anciens participants
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
                message=f"{sender_user.prenom} a posté dans « {titre_forum} » : {message_preview}"
            )

        # Notifier les admins
        #notify_admins(
        #    message=f"{sender_user.prenom} a posté dans le forum « {titre_forum} »",
        #    content_object=forum,
        #    action_type="new_message",
          #  module_source="forum",
         #   envoyeur=sender_user
        #)

        # Notifier l'auteur du forum s'il existe et n'est pas le posteur
        if forum.utilisateur and forum.utilisateur != sender_user:
            create_notification(
                destinataire=forum.utilisateur,
                envoyeur=sender_user,
                content_object=forum,
                action_type="reply_in_your_forum",
                module_source="forum",
                message=f"{sender_user.prenom} a répondu dans votre forum « {titre_forum} »"
            )


# =========================
# 🔔 COMMENTAIRE SUR MESSAGE (AVEC ADMIN)
# =========================
@receiver(post_save, sender=Commentaire)
def notify_comment(sender, instance, created, **kwargs):
    if not created:
        return

    comment = instance
    message = comment.message
    forum = message.forum
    user = comment.utilisateur
    admin = comment.administrateur
    titre_forum = forum.titre_forum[:50]
    
    # Préparer le contenu tronqué du commentaire
    comment_preview = comment.contenu_comm[:80]
    if len(comment.contenu_comm) > 80:
        comment_preview += "..."

    # COMMENTAIRE POSTÉ PAR UN ADMIN
    if admin and not user:
        # 1. Notifier l'auteur du message (s'il existe)
        if message.utilisateur:
            create_notification(
                destinataire=message.utilisateur,
                envoyeur=None,
                content_object=message,
                action_type="admin_comment",
                module_source="forum",
                message=f"👑 L'administrateur a commenté votre message dans « {titre_forum} » : {comment_preview}"
            )
        
        # 2. Notifier les autres participants de la discussion
        # Récupérer tous ceux qui ont commenté ou liké ce message
        commenters = Commentaire.objects.filter(message=message)\
            .exclude(administrateur=admin)\
            .values_list('utilisateur_id', flat=True).distinct()
        
        likers = MessageLike.objects.filter(message=message)\
            .exclude(administrateur=admin)\
            .values_list('utilisateur_id', flat=True).distinct()
        
        participant_ids = set(list(commenters) + list(likers))
        participants = Utilisateur.objects.filter(id_utilisateur__in=participant_ids)
        
        for participant in participants:
            create_notification(
                destinataire=participant,
                envoyeur=None,
                content_object=message,
                action_type="admin_comment_in_thread",
                module_source="forum",
                message=f"👑 L'administrateur a commenté dans une discussion que vous suivez dans « {titre_forum} »"
            )
        
        # 3. Notifier les autres admins
        other_admins = Administrateur.objects.exclude(id_admin=admin.id_admin)
        for other_admin in other_admins:
            create_notification(
                admin_destinataire=other_admin,
                envoyeur=admin,
                content_object=message,
                action_type="admin_comment_posted",
                module_source="forum",
                message=f"👑 {admin.email_admin} a commenté dans le forum « {titre_forum} »"
            )
        
        # 4. Notifier l'auteur du forum s'il existe et n'est pas déjà notifié
        if forum.utilisateur and forum.utilisateur != message.utilisateur:
            create_notification(
                destinataire=forum.utilisateur,
                envoyeur=None,
                content_object=forum,
                action_type="admin_comment_in_your_forum",
                module_source="forum",
                message=f"👑 L'administrateur a commenté dans votre forum « {titre_forum} »"
            )

    # COMMENTAIRE POSTÉ PAR UN UTILISATEUR NORMAL
    elif user and not admin:
        # Notifier l'auteur du message (s'il existe et n'est pas le commentateur)
        if message.utilisateur and message.utilisateur != user:
            create_notification(
                destinataire=message.utilisateur,
                envoyeur=user,
                content_object=message,
                action_type="comment",
                module_source="forum",
                message=f"{user.prenom} a commenté votre message dans « {titre_forum} » : {comment_preview}"
            )
        
        # Notifier les autres commentateurs du message (sauf l'auteur et le commentateur actuel)
        other_commenters = Commentaire.objects.filter(message=message)\
            .exclude(utilisateur=user)\
            .exclude(utilisateur=message.utilisateur)\
            .values_list('utilisateur_id', flat=True).distinct()
        
        for commenter_id in other_commenters:
            try:
                commenter = Utilisateur.objects.get(id_utilisateur=commenter_id)
                create_notification(
                    destinataire=commenter,
                    envoyeur=user,
                    content_object=message,
                    action_type="new_comment_in_thread",
                    module_source="forum",
                    message=f"{user.prenom} a aussi commenté dans « {titre_forum} » : {comment_preview}"
                )
            except Utilisateur.DoesNotExist:
                pass
        
        # Notifier les admins
        notify_admins(
            message=f"{user.prenom} a commenté un message dans « {titre_forum} »",
            content_object=message,
            action_type="comment_added",
            module_source="forum",
            envoyeur=user
        )
        
        # Notifier l'auteur du forum s'il existe et n'est pas déjà notifié
        if forum.utilisateur and forum.utilisateur != user and forum.utilisateur != message.utilisateur:
            create_notification(
                destinataire=forum.utilisateur,
                envoyeur=user,
                content_object=forum,
                action_type="comment_in_your_forum",
                module_source="forum",
                message=f"{user.prenom} a commenté dans votre forum « {titre_forum} »"
            )


# =========================
# 🔔 LIKE MESSAGE (AVEC ADMIN)
# =========================
@receiver(post_save, sender=MessageLike)
def notify_message_like(sender, instance, created, **kwargs):
    if not created:
        return

    message = instance.message
    forum = message.forum
    user = instance.utilisateur
    admin = instance.administrateur
    titre_forum = forum.titre_forum[:50]
    message_preview = message.contenu_message[:80]
    if len(message.contenu_message) > 80:
        message_preview += "..."

    # ADMIN LIKE UN MESSAGE
    if admin and not user:
        # 1. Notifier l'auteur du message (s'il existe)
        if message.utilisateur:
            create_notification(
                destinataire=message.utilisateur,
                envoyeur=None,
                content_object=message,
                action_type="admin_message_like",
                module_source="forum",
                message=f"👑 L'administrateur a aimé votre message dans « {titre_forum} » : {message_preview}"
            )
        
        # 2. Notifier les autres participants
        # Récupérer ceux qui ont commenté ce message
        commenters = Commentaire.objects.filter(message=message)\
            .exclude(utilisateur=message.utilisateur)\
            .values_list('utilisateur_id', flat=True).distinct()
        
        for commenter_id in commenters:
            try:
                commenter = Utilisateur.objects.get(id_utilisateur=commenter_id)
                create_notification(
                    destinataire=commenter,
                    envoyeur=None,
                    content_object=message,
                    action_type="admin_like_in_thread",
                    module_source="forum",
                    message=f"👑 L'administrateur a aimé un message dans « {titre_forum} » que vous avez commenté"
                )
            except Utilisateur.DoesNotExist:
                pass
        
        # 3. Notifier les autres admins
        other_admins = Administrateur.objects.exclude(id_admin=admin.id_admin)
        for other_admin in other_admins:
            create_notification(
                admin_destinataire=other_admin,
                envoyeur=admin,
                content_object=message,
                action_type="admin_message_interaction",
                module_source="forum",
                message=f"👑 {admin.email_admin} a aimé un message dans « {titre_forum} »"
            )
        
        # 4. Notifier l'auteur du forum s'il existe et n'est pas l'auteur du message
        if forum.utilisateur and forum.utilisateur != message.utilisateur:
            create_notification(
                destinataire=forum.utilisateur,
                envoyeur=None,
                content_object=forum,
                action_type="admin_interaction_in_your_forum",
                module_source="forum",
                message=f"👑 L'administrateur a aimé un message dans votre forum « {titre_forum} »"
            )

    # UTILISATEUR NORMAL LIKE UN MESSAGE
    elif user and not admin:
        # Notifier l'auteur du message (s'il existe et n'est pas l'utilisateur)
        if message.utilisateur and message.utilisateur != user:
            create_notification(
                destinataire=message.utilisateur,
                envoyeur=user,
                content_object=message,
                action_type="message_like",
                module_source="forum",
                message=f"{user.prenom} a aimé votre message dans « {titre_forum} » : {message_preview}"
            )
        
        # Notifier les autres personnes qui ont liké ce message
        other_likers = MessageLike.objects.filter(message=message)\
            .exclude(utilisateur=user)\
            .exclude(utilisateur=message.utilisateur)\
            .values_list('utilisateur_id', flat=True).distinct()
        
        for liker_id in other_likers[:5]:  # Limiter à 5 notifications
            try:
                liker = Utilisateur.objects.get(id_utilisateur=liker_id)
                create_notification(
                    destinataire=liker,
                    envoyeur=user,
                    content_object=message,
                    action_type="mutual_like",
                    module_source="forum",
                    message=f"{user.prenom} a aussi aimé un message que vous aimez dans « {titre_forum} »"
                )
            except Utilisateur.DoesNotExist:
                pass
        
        # Notifier les admins
        notify_admins(
            message=f"{user.prenom} a aimé un message dans « {titre_forum} »",
            content_object=message,
            action_type="message_like",
            module_source="forum",
            envoyeur=user
        )
        
        # Notifier l'auteur du forum s'il existe et n'est pas déjà notifié
        if forum.utilisateur and forum.utilisateur != user and forum.utilisateur != message.utilisateur:
            create_notification(
                destinataire=forum.utilisateur,
                envoyeur=user,
                content_object=forum,
                action_type="like_in_your_forum",
                module_source="forum",
                message=f"{user.prenom} a aimé un message dans votre forum « {titre_forum} »"
            )
from django.db.models.signals import post_save
from django.dispatch import receiver
from feedback.models import Notification
from .models import GagnerBadge

# --------------------------
# Notification : Badge débloqué
# --------------------------
@receiver(post_save, sender=GagnerBadge)
def notify_badge_unlocked(sender, instance, created, **kwargs):
    if created:
        user = instance.utilisateur
        badge = instance.badge
        Notification.objects.create(
            utilisateur_destinataire=user,
            action_type='badge_unlocked',
            module_source='achievements',
            message_notif=f"Félicitations ! Vous avez débloqué le badge '{badge.nom}' !"
        )


@receiver(post_save, sender=GagnerBadge)
def notify_special_badges(sender, instance, created, **kwargs):
    if created:
        user = instance.utilisateur
        badge = instance.badge
        special_messages = {
            "All-Rounder": "Vous avez complété un cours, un exercice et un quiz !",
            "Legendary Coder": "Félicitations ! Vous avez tout terminé sur la plateforme !",
            "Night Owl": "Bravo ! Vous avez soumis un exercice entre minuit et 6h !"
        }
        msg = special_messages.get(badge.nom, f"Vous avez débloqué le badge '{badge.nom}' !")
        Notification.objects.create(
            utilisateur_destinataire=user,
            action_type='badge_unlocked',
            module_source='achievements',
            message_notif=msg,
            extra_data={"badge_id": badge.id}
        )

from forum.models import Commentaire, Like

@receiver(post_save, sender=Commentaire)
def notify_top_commentator(sender, instance, created, **kwargs):
    if created:
        user = instance.utilisateur
        comment_count = Commentaire.objects.filter(utilisateur=user).count()
        threshold = 20
        if comment_count == threshold:
            Notification.objects.create(
                utilisateur_destinataire=user,
                action_type='top_commentator',
                module_source='forum',
                message_notif="Félicitations ! Vous êtes maintenant un Top Commentateur !",
            )

@receiver(post_save, sender=Like)
def notify_top_forum(sender, instance, created, **kwargs):
    if created:
        user = instance.forum.utilisateur
        total_likes = Like.objects.filter(forum__utilisateur=user).count()
        threshold = 20
        if total_likes == threshold:
            Notification.objects.create(
                utilisateur_destinataire=user,
                action_type='top_forum',
                module_source='forum',
                message_notif=f"Bravo ! Vos forums ont atteint {threshold} likes cumulés !"
            )
from dashboard.models import ProgressionCours
from feedback.models import Notification

@receiver(post_save, sender=ProgressionCours)
def notify_course_badges(sender, instance, created, **kwargs):
    """
    Vérifie si l'utilisateur débloque un badge lié au cours terminé
    et crée la notification correspondante.
    """
    if instance.avancement_cours == 100:
        user = instance.utilisateur
        course = instance.cours

        # Appelle la fonction qui attribue les badges
        from badges.views import check_course_badges
        check_course_badges(user, instance)

        # Vérifier quels badges ont été gagnés pour cet utilisateur récemment
        # Ici on récupère le dernier badge attribué pour s'assurer de notifier
        last_badge = GagnerBadge.objects.filter(utilisateur=user).order_by('-date_obtention').first()
        if last_badge:
            Notification.objects.create(
                utilisateur_destinataire=user,
                action_type='badge_unlocked',
                module_source='achievements',
                message_notif=f"Félicitations ! Vous avez débloqué le badge '{last_badge.badge.nom}' pour le cours '{course.titre_cour}' !",
                extra_data={
                    "badge_id": last_badge.badge.id,
                    "course_id": course.id_cours
                }
            )

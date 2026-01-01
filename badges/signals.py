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

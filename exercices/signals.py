# exercices/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Exercice
from feedback.models import Notification
from users.models import Utilisateur, Administrateur

@receiver(post_save, sender=Exercice)
def notify_on_public_exercice_create(sender, instance, created, **kwargs):
    if not created:
        return

    exercice = instance

    # 🔒 Exercice privé → aucune notification
    if not exercice.visibilite_exo:
        return

    content_type = ContentType.objects.get_for_model(Exercice)
    notifications = []

    prof = exercice.utilisateur
    prof_name = f"{prof.nom} {prof.prenom}" if prof else "un professeur"

    # ======================
    # 🎓 Étudiants
    # ======================
    etudiants = Utilisateur.objects.filter(etudiant__isnull=False)
    for etudiant in etudiants:
        notifications.append(
            Notification(
                utilisateur_destinataire=etudiant,
                utilisateur_envoyeur=prof,
                message_notif=f"Nouveau exercice public : {exercice.titre_exo}",
                content_type=content_type,
                object_id=exercice.pk,
                action_type="exercice_created",
                module_source="exercice",
                extra_data={
                    "titre_exo": exercice.titre_exo,
                    "public": True
                }
            )
        )

    # ======================
    # 🛠️ Administrateurs
    # ======================
    admins = Administrateur.objects.all()
    for admin in admins:
        notifications.append(
            Notification(
                admin_destinataire=admin,
                utilisateur_envoyeur=prof,
                message_notif=(
                    f"Nouveau exercice créé par {prof_name} : "
                    f"{exercice.titre_exo}"
                ),
                content_type=content_type,
                object_id=exercice.pk,
                action_type="exercice_created",
                module_source="exercice",
                extra_data={
                    "titre_exo": exercice.titre_exo,
                    "auteur": prof_name,
                    "public": True
                }
            )
        )

    Notification.objects.bulk_create(notifications)
import threading
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from exercices.models import Exercice
from feedback.models import Notification

@receiver(post_save, sender=Exercice)
def notify_teacher_on_exercice_update(sender, instance, created, **kwargs):
    if created:
        return  # pas de notif à la création

    # Récupère l'admin courant depuis le thread
    admin = getattr(threading.current_thread(), "current_admin", None)
    if not admin:
        return  # pas d'admin → pas de notif

    teacher = instance.utilisateur
    if not teacher:
        return

    Notification.objects.create(
        utilisateur_destinataire=teacher,
        admin_destinataire=None,  # l'admin ne reçoit pas la notif
        action_type="exercise_updated",
        module_source="EXERCICES",
        message_notif=f"Votre exercice '{instance.titre_exo}' a été modifié par un administrateur.",
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.id_exercice,
        extra_data={
            "admin_id": admin.id_admin,
            "admin_email": admin.email_admin
        }
    )


@receiver(post_delete, sender=Exercice)
def notify_teacher_on_exercice_delete(sender, instance, **kwargs):
    admin = getattr(threading.current_thread(), "current_admin", None)
    if not admin:
        return

    teacher = instance.utilisateur
    if not teacher:
        return

    Notification.objects.create(
        utilisateur_destinataire=teacher,
        admin_destinataire=None,
        action_type="exercise_deleted",
        module_source="EXERCICES",
        message_notif=f"Votre exercice '{instance.titre_exo}' a été supprimé par un administrateur.",
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.id_exercice,
        extra_data={
            "admin_id": admin.id_admin,
            "admin_email": admin.email_admin
        }
    )

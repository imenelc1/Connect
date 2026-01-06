# quiz/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Quiz
from feedback.models import Notification
from users.models import Utilisateur, Administrateur
@receiver(post_save, sender=Quiz)
def notify_on_quiz_create(sender, instance, created, **kwargs):
    if not created:
        return

    quiz = instance
    content_type = ContentType.objects.get_for_model(Quiz)
    notifications = []

    # Prof (auteur)
    prof = getattr(quiz.exercice, "utilisateur", None)
    prof_name = f"{prof.nom} {prof.prenom}" if prof else "un professeur"

    # ======================
    # 🎓 Étudiants → seulement si quiz public
    # ======================
    if quiz.exercice.visibilite_exo:
        etudiants = Utilisateur.objects.filter(etudiant__isnull=False)
        for etudiant in etudiants:
            notifications.append(
                Notification(
                    utilisateur_destinataire=etudiant,
                    utilisateur_envoyeur=prof,
                    message_notif=f"Nouveau quiz public : {quiz.exercice.titre_exo}",
                    content_type=content_type,
                    object_id=quiz.pk,
                    action_type="quiz_created",
                    module_source="quiz",
                    extra_data={
                        "titre_quiz": quiz.exercice.titre_exo,
                        "public": True
                    }
                )
            )

    # ======================
    # 🛠️ Administrateurs → toujours notifiés
    # ======================
    admins = Administrateur.objects.all()
    for admin in admins:
        notifications.append(
            Notification(
                admin_destinataire=admin,
                utilisateur_envoyeur=prof,
                message_notif=f"Nouveau quiz créé par {prof_name} : {quiz.exercice.titre_exo}",
                content_type=content_type,
                object_id=quiz.pk,
                action_type="quiz_created",
                module_source="quiz",
                extra_data={
                    "titre_quiz": quiz.exercice.titre_exo,
                    "auteur": prof_name,
                    "public": quiz.exercice.visibilite_exo
                }
            )
        )

    Notification.objects.bulk_create(notifications)


import threading
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from quiz.models import Quiz
from feedback.models import Notification

@receiver(post_save, sender=Quiz)
def notify_teacher_on_quiz_update(sender, instance, created, **kwargs):
    if created:
        return  # ignore la création

    # Vérifie si c'est un admin grâce au middleware threading
    admin = getattr(threading.current_thread(), "current_admin", None)
    if not admin:
        return  # action non faite par un admin → pas de notif

    # L'enseignant auteur est celui qui a créé l'exercice
    teacher = instance.exercice.utilisateur
    if not teacher:
        return

    Notification.objects.create(
        utilisateur_destinataire=teacher,
        admin_destinataire=None,  # admin ne reçoit pas la notif
        action_type="quiz_updated",
        module_source="QUIZ",
        message_notif=f"Votre quiz '{instance.exercice.titre_exo}' a été modifié par un administrateur.",
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.id,
        extra_data={
            "admin_id": admin.id_admin,
            "admin_email": admin.email_admin
        }
    )


@receiver(post_delete, sender=Quiz)
def notify_teacher_on_quiz_delete(sender, instance, **kwargs):
    admin = getattr(threading.current_thread(), "current_admin", None)
    if not admin:
        return

    teacher = instance.exercice.utilisateur
    if not teacher:
        return

    Notification.objects.create(
        utilisateur_destinataire=teacher,
        admin_destinataire=None,
        action_type="quiz_deleted",
        module_source="QUIZ",
        message_notif=f"Votre quiz '{instance.exercice.titre_exo}' a été supprimé par un administrateur.",
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.id,
        extra_data={
            "admin_id": admin.id_admin,
            "admin_email": admin.email_admin
        }
    )

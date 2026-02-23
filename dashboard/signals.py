# courses/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from courses.models import Cours
from feedback.models import Notification
from users.models import Utilisateur, Administrateur
from spaces.models import SpaceCour, SpaceEtudiant

@receiver(post_save, sender=Cours)
def notify_students_on_course_publish(sender, instance, created, **kwargs):
    if not created:
        return

    cours = instance
    prof = cours.utilisateur
    content_type = ContentType.objects.get_for_model(Cours)
    notifications = []

    if cours.visibilite_cour:
        # --- Cours public : notifier tous les étudiants ---
        etudiants = Utilisateur.objects.filter(etudiant__isnull=False)
        for etudiant in etudiants:
            notifications.append(
                Notification(
                    message_notif=f"Nouveau cours public publié : {cours.titre_cour}",
                    utilisateur_destinataire=etudiant,
                    utilisateur_envoyeur=prof,
                    content_type=content_type,
                    object_id=cours.id_cours,
                    action_type="course_published",
                    module_source="cours",
                    extra_data={
                        "cours_titre": cours.titre_cour,
                        "niveau": cours.niveau_cour,
                        "public": True
                    }
                )
            )
    
        # --- Cours privé : notifier rien  ---
        

    # --- Notifications pour tous les admins ---
    admins = Administrateur.objects.all()
    for admin in admins:
        notifications.append(
            Notification(
                message_notif=f"Nouveau cours publié : {cours.titre_cour}",
                admin_destinataire=admin,
                utilisateur_envoyeur=prof,
                content_type=content_type,
                object_id=cours.id_cours,
                action_type="course_published",
                module_source="cours",
                extra_data={
                    "cours_titre": cours.titre_cour,
                    "niveau": cours.niveau_cour,
                    "public": cours.visibilite_cour,
                }
            )
        )

    if notifications:
        Notification.objects.bulk_create(notifications)

import threading
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from courses.models import Cours
from feedback.models import Notification
from users.models import Administrateur

@receiver(post_save, sender=Cours)
def notify_prof_on_course_update(sender, instance, created, **kwargs):
    if created:
        return  # ignore creation

    # Récupère l'admin courant depuis le middleware
      # pas d'admin connecté → pas de notif

    prof = instance.utilisateur
    if not prof:
        return

    Notification.objects.create(
    message_notif=f"Votre cours '{instance.titre_cour}' a été modifié par un administrateur.",
    utilisateur_destinataire=prof,
    admin_destinataire=None,
    action_type="UPDATE",
    module_source="COURS",
    content_type=ContentType.objects.get_for_model(instance),
    object_id=instance.id_cours,
    extra_data={}   #vide = sûr
)

    # Récupère l'admin courant depuis le middleware
      # pas d'admin connecté → pas de notif

# -----------------------------
# SIGNAL DELETE
# -----------------------------
@receiver(post_delete, sender=Cours)
def notify_prof_on_course_delete(sender, instance, **kwargs):
    admin = getattr(threading.current_thread(), "current_admin", None)
    if not admin:
        return

    prof = instance.utilisateur
    if not prof:
        return

    Notification.objects.create(
        message_notif=f"Votre cours '{instance.titre_cour}' a été supprimé par un administrateur.",
        utilisateur_destinataire=prof,
        admin_destinataire=None,  # ADMIN non destinataire
        action_type="DELETE",
        module_source="COURS",
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.id_cours,
        extra_data={
            "deleted_course_id": instance.id_cours,
            "deleted_course_title": instance.titre_cour,
            "admin_id": admin.id_admin,
            "admin_email": admin.email_admin
        }
    )
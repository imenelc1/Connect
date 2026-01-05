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


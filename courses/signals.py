# courses/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from courses.models import Cours
from feedback.models import Notification
from users.models import Utilisateur
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
    else:
        # --- Cours privé : notifier seulement les étudiants des espaces du prof ---
        # Récupérer tous les espaces du prof
        espaces_prof = cours.utilisateur.space_set.all()
        for espace in espaces_prof:
            etudiants = Utilisateur.objects.filter(
                etudiant__isnull=False,
                spaceetudiant__space=espace
            ).distinct()

            for etudiant in etudiants:
                notifications.append(
                    Notification(
                        message_notif=f"Nouveau cours privé publié '{cours.titre_cour}'",
                        utilisateur_destinataire=etudiant,
                        utilisateur_envoyeur=prof,
                        content_type=content_type,
                        object_id=cours.id_cours,
                        action_type="course_published",
                        module_source="cours",
                        extra_data={
                            "cours_titre": cours.titre_cour,
                            "niveau": cours.niveau_cour,
                            "public": False,
                            "espace_id": espace.id_space,
                            "espace_nom": espace.nom_space
                        }
                    )
                )

    if notifications:
        Notification.objects.bulk_create(notifications)

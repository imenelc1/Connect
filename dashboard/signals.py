from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from dashboard.models import TentativeExercice
from feedback.models import Notification

@receiver(post_save, sender=TentativeExercice)
def notify_prof_on_submission(sender, instance, created, **kwargs):
    """
    Crée une notification pour le prof quand un étudiant soumet un exercice.
    Évite les doublons.
    """
    # Ne créer la notif que si l'état est soumis
    if instance.etat != "soumis":
        return

    exercice = instance.exercice
    student = instance.utilisateur
    prof = exercice.utilisateur  # le prof lié à l'exercice

    content_type = ContentType.objects.get_for_model(TentativeExercice)

    # Vérifie si la notification existe déjà
    existing = Notification.objects.filter(
        content_type=content_type,
        object_id=instance.id,
        action_type="submission",
        utilisateur_destinataire=prof,
        utilisateur_envoyeur=student
    ).exists()

    if existing:
        return  # notification déjà créée, on ne fait rien

    # Sinon, créer la notification
    Notification.objects.create(
        utilisateur_destinataire=prof,
        utilisateur_envoyeur=student,
        message_notif=f"L'étudiant {student.nom} {student.prenom} a soumis une solution de l'exercice '{exercice.titre_exo}'",
        content_type=content_type,
        object_id=instance.id,
        action_type="submission",
        module_source="exercice",
        extra_data={
            "exercice_id": exercice.id_exercice,
            "student_id": student.id_utilisateur
        }
    )
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType

from feedback.models import FeedbackExercice
from dashboard.models import TentativeExercice
from feedback.models import Notification


@receiver(post_save, sender=FeedbackExercice)
def notify_student_on_feedback(sender, instance, created, **kwargs):
    """
    Notifie l'étudiant quand un professeur écrit ou modifie un feedback
    """

    tentative = instance.tentative
    exercice = instance.exercice
    student = tentative.utilisateur
    prof = instance.auteur

    content_type = ContentType.objects.get_for_model(FeedbackExercice)

    # ❌ éviter doublons : un feedback par tentative
    existing = Notification.objects.filter(
        content_type=content_type,
        object_id=instance.id,
        action_type="feedback",
        utilisateur_destinataire=student,
        utilisateur_envoyeur=prof
    ).exists()

    if existing:
        return

    Notification.objects.create(
        utilisateur_destinataire=student,
        utilisateur_envoyeur=prof,
        message_notif=(
            f"Le professeur {prof.nom} {prof.prenom} a laissé un feedback "
            f"sur votre solution de l'exercice '{exercice.titre_exo}'"
        ),
        content_type=content_type,
        object_id=instance.id,
        action_type="feedback",
        module_source="exercice",
        extra_data={
            "tentative_id": tentative.id,
            "exercice_id": exercice.id_exercice
        }
    )

# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Quiz
from users.models import Utilisateur, Student  # Student = modèle des étudiants
from notifications.models import Notification  # ton modèle notification

@receiver(post_save, sender=Quiz)
def notify_students_on_quiz(sender, instance, created, **kwargs):
    """
    Notifie les étudiants lorsqu'un Quiz est créé.
    - Si l'exercice est public : tous les étudiants du cours
    - Si l'exercice est privé : seulement les étudiants des espaces du professeur
    """
    if not created:
        return  # on ne notifie que lors de la création

    exercice = instance.exercice
    professeur = exercice.utilisateur
    cours = exercice.cours

    if exercice.visibilite_exo:
        # Exercice public : tous les étudiants du cours
        students = Student.objects.filter(cours=cours)
    else:
        # Exercice privé : seulement les étudiants des espaces du professeur
        students = Student.objects.filter(espaces__professeur=professeur).distinct()

    notifications = [
        Notification(
            utilisateur_destinataire=student.user,
            message_notif=f"Nouveau quiz disponible : {exercice.titre_exo}",
            quiz=instance
        )
        for student in students
    ]
    Notification.objects.bulk_create(notifications)

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Exercice
from spaces.models import SpaceCour, SpaceEtudiant
from feedback.utils import create_notification

@receiver(post_save, sender=Exercice)
def notify_students_new_exercice(sender, instance, created, **kwargs):
    if not created:
        return

    exercice = instance
    professeur = exercice.utilisateur
    cours = exercice.cours

    if exercice.visibilite_exo:
        # Exercice public → tous les étudiants
        from users.models import Utilisateur
        students = Utilisateur.objects.filter(role='etudiant')
    else:
        # Exercice privé → étudiants des espaces contenant ce cours
        space_ids = SpaceCour.objects.filter(cours=cours).values_list('space_id', flat=True)
        students = Utilisateur.objects.filter(
            spaceetudiant__space_id__in=space_ids
        ).distinct()

    for student in students:
        try:
            create_notification(
                destinataire=student,
                envoyeur=professeur,
                content_object=exercice,
                action_type='new_exercice',
                module_source='exercice',
                message=f"{professeur.prenom} a publié l'exercice '{exercice.titre_exo}'."
            )
        except Exception as e:
            print(f"Erreur notification exercice pour {student}: {e}")

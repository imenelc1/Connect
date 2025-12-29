# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Quiz
from users.models import Etudiant
from feedback.utils import create_notification
from spaces.models import SpaceCour  # pour récupérer les espaces où le cours est ajouté

@receiver(post_save, sender=Quiz)
def notify_students_on_quiz(sender, instance, created, **kwargs):
    if not created:
        return

    quiz = instance
    exercice = quiz.exercice
    professeur = exercice.utilisateur
    cours = exercice.cours

    if exercice.visibilite_exo:
        # Quiz public → tous les étudiants du cours
        etudiants = Etudiant.objects.filter(cours=cours)
        message_info = f"nouveau quiz public : {exercice.titre_exo} (du cours '{cours.titre_cour}')"
    else:
        # Quiz privé → uniquement les étudiants des espaces où le cours est ajouté
        espaces = SpaceCour.objects.filter(cours=cours).select_related('space')
        etudiants_ids = []
        espaces_noms = []
        for espace in espaces:
            students_in_space = espace.space.spaceetudiant_set.all()
            etudiants_ids.extend([se.etudiant.id_utilisateur for se in students_in_space])
            espaces_noms.append(espace.space.nom_space)
        etudiants = Etudiant.objects.filter(utilisateur__id_utilisateur__in=etudiants_ids).distinct()
        message_info = f"de l'espace {', '.join(espaces_noms)}"

    # Créer les notifications
    for etudiant in etudiants:
        try:
            create_notification(
                destinataire=etudiant.utilisateur,
                envoyeur=professeur,
                content_object=quiz,
                action_type='new_quiz',
                module_source='quiz',
                message=f"Nouveau quiz disponible : {exercice.titre_exo} ({message_info})"
            )
        except Exception as e:
            print(f"Erreur notification quiz pour {etudiant}: {e}")

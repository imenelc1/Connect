from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SpaceEtudiant
from feedback.utils import create_notification

@receiver(post_save, sender=SpaceEtudiant)
def notify_student_added_to_space(sender, instance, created, **kwargs):
    if not created:
        return

    space_etudiant = instance
    etudiant = space_etudiant.etudiant
    space = space_etudiant.space
    professeur = space.utilisateur

    try:
        create_notification(
            destinataire=etudiant,
            envoyeur=professeur,
            content_object=space,
            action_type='added_to_space',
            module_source='space',
            message=f"{professeur.prenom} vous a ajouté à l'espace '{space.nom_space}'."
        )
    except Exception as e:
        print(f"Erreur notification ajout étudiant à l'espace: {e}")
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SpaceCour, SpaceEtudiant
from feedback.utils import create_notification

@receiver(post_save, sender=SpaceCour)
def notify_students_new_course(sender, instance, created, **kwargs):
    if not created:
        return

    space_cour = instance
    cours = space_cour.cours
    space = space_cour.space
    professeur = space.utilisateur

    # Récupérer tous les étudiants dans cet espace
    students = SpaceEtudiant.objects.filter(space=space).select_related('etudiant')

    for student_rel in students:
        student = student_rel.etudiant
        try:
            create_notification(
                destinataire=student,
                envoyeur=professeur,
                content_object=cours,
                action_type='new_course_in_space',
                module_source='space',
                message=f"{professeur.prenom} a ajouté le cours '{cours.titre_cour}' dans l'espace '{space.nom_space}'."
            )
        except Exception as e:
            print(f"Erreur notification cours ajouté à l'espace pour {student}: {e}")

#jssp est ce que il va marcher 
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SpaceCour, SpaceEtudiant
from feedback.utils import create_notification

@receiver(post_save, sender=SpaceCour)
def notify_students_new_course(sender, instance, created, **kwargs):
    if not created:
        return

    space_cour = instance
    cours = space_cour.cours
    space = space_cour.space
    professeur = space.utilisateur

    # Récupérer tous les étudiants dans cet espace
    students = SpaceEtudiant.objects.filter(space=space).select_related('etudiant')

    for student_rel in students:
        student = student_rel.etudiant
        try:
            create_notification(
                destinataire=student,
                envoyeur=professeur,
                content_object=cours,
                action_type='new_course_in_space',
                module_source='space',
                message=f"{professeur.prenom} a ajouté le cours '{cours.titre_cour}' dans l'espace '{space.nom_space}'."
            )
        except Exception as e:
            print(f"Erreur notification cours ajouté à l'espace pour {student}: {e}")

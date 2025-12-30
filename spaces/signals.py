from django.db.models.signals import post_save
from django.dispatch import receiver

from feedback.utils import create_notification
from .models import SpaceEtudiant, SpaceCour, SpaceExo, SpaceQuiz, Space
from users.models import Administrateur


# ===============================
# 1️⃣ ADMIN : nouvel espace créé
# ===============================
@receiver(post_save, sender=Space)
def notify_admin_new_space(sender, instance, created, **kwargs):
    if not created:
        return

    space = instance
    creator = space.utilisateur
    admins = Administrateur.objects.all()

    for admin in admins:
        try:
            create_notification(
                destinataire=admin,
                envoyeur=creator,
                content_object=space,
                action_type="space_created",
                module_source="space",
                message=f"{creator.prenom} a créé un nouvel espace : '{space.nom_space}'."
            )
        except Exception as e:
            print(f"Erreur notif admin création space: {e}")


# =================================
# 2️⃣ ÉTUDIANT ajouté à un espace
# =================================
@receiver(post_save, sender=SpaceEtudiant)
def notify_student_added_to_space(sender, instance, created, **kwargs):
    if not created:
        return

    student = instance.etudiant
    space = instance.space
    prof = space.utilisateur

    try:
        create_notification(
            destinataire=student,
            envoyeur=prof,
            content_object=space,
            action_type="added_to_space",
            module_source="space",
            message=f"{prof.prenom} vous a ajouté à l'espace '{space.nom_space}'."
        )
    except Exception as e:
        print(f"Erreur notification ajout étudiant à l'espace: {e}")


# =========================
# 3️⃣ Cours ajouté à un espace
# =========================
@receiver(post_save, sender=SpaceCour)
def notify_students_new_course(sender, instance, created, **kwargs):
    if not created:
        return

    space = instance.space
    cours = instance.cours
    prof = space.utilisateur

    students = SpaceEtudiant.objects.filter(space=space).select_related("etudiant")

    for rel in students:
        try:
            create_notification(
                destinataire=rel.etudiant,
                envoyeur=prof,
                content_object=cours,
                action_type="new_course_in_space",
                module_source="space",
                message=f"{prof.prenom} a ajouté le cours '{cours.titre_cour}' dans l'espace '{space.nom_space}'."
            )
        except Exception as e:
            print(f"Erreur notification cours espace: {e}")


# =========================
# 4️⃣ Exercice ajouté à un espace
# =========================
@receiver(post_save, sender=SpaceExo)
def notify_students_new_exercice(sender, instance, created, **kwargs):
    if not created:
        return

    space = instance.space
    exercice = instance.exercice
    prof = space.utilisateur

    students = SpaceEtudiant.objects.filter(space=space).select_related("etudiant")

    for rel in students:
        try:
            create_notification(
                destinataire=rel.etudiant,
                envoyeur=prof,
                content_object=exercice,
                action_type="new_exercice_in_space",
                module_source="exercice",
                message=f"{prof.prenom} a ajouté l'exercice '{exercice.titre_exo}' dans l'espace '{space.nom_space}'."
            )
        except Exception as e:
            print(f"Erreur notification exercice espace: {e}")


# =========================
# 5️⃣ Quiz ajouté à un espace
# =========================
from django.db.models.signals import post_save
from django.dispatch import receiver
from feedback.utils import create_notification
from .models import SpaceQuiz, SpaceEtudiant

@receiver(post_save, sender=SpaceQuiz)
def notify_students_new_quiz(sender, instance, created, **kwargs):
    # Toujours notifier, même si get_or_create retourne created=False
    space = instance.space
    quiz = instance.quiz
    prof = space.utilisateur

    students = SpaceEtudiant.objects.filter(space=space).select_related('etudiant')

    for rel in students:
        student = rel.etudiant
        try:
            create_notification(
                destinataire=student,
                envoyeur=prof,
                content_object=quiz,
                action_type='new_quiz_in_space',
                module_source='quiz',
                message=f"{prof.prenom} a ajouté le quiz '{quiz.titre}' dans l'espace '{space.nom_space}'."
            )
        except Exception as e:
            print(f"Erreur notification quiz ajouté à l'espace pour {student}: {e}")

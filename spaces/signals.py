from django.db.models.signals import post_save
from django.dispatch import receiver

from feedback.utils import create_notification
from .models import SpaceEtudiant, SpaceCour, SpaceExo, SpaceQuiz, Space
from users.models import Administrateur
from feedback.models import Notification

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


from users.models import Administrateur

def is_admin_user(utilisateur):
    return Administrateur.objects.filter(
        email_admin=utilisateur.adresse_email
    ).exists()

@receiver(post_save, sender=Space)
def notify_owner_on_space_creation(sender, instance, created, **kwargs):
    if not created:
        return

    owner = instance.utilisateur

    # ❌ EXCLURE ADMIN
    is_admin = Administrateur.objects.filter(
        email_admin=owner.adresse_email
    ).exists()

    if is_admin:
        return

    Notification.objects.create(
        message_notif=f"Un nouvel espace '{instance.nom_space}' vous a été assigné.",
        utilisateur_destinataire=owner,
        action_type="assignation_espace",
        module_source="Espace",
        extra_data={
            "space_id": instance.id_space,
            "space_title": instance.nom_space
        }
    )



# @receiver(post_save, sender=SpaceEtudiant)
# def notify_student_added(sender, instance, created, **kwargs):
#     """
#     Envoie une notification à l'étudiant ajouté à un space.
#     """
#     if created:  # seulement si c'est un nouvel ajout
#         Notification.objects.create(
#             message_notif=f"Vous avez été ajouté à l'espace '{instance.space.nom_space}'.",
#             utilisateur_destinataire=instance.etudiant,
#             action_type="ajout_espace",
#             module_source="Espace",
#             extra_data={"space_id": instance.space.id_space, "space_title": instance.space.nom_space}
#         )
# quiz/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Quiz
from feedback.models import Notification
from users.models import Utilisateur, Administrateur

@receiver(post_save, sender=Quiz)
def notify_on_public_quiz_create(sender, instance, created, **kwargs):
    if not created:
        return

    quiz = instance

    #  Quiz privé → aucune notification
    if not quiz.exercice.visibilite_exo:
        return

    content_type = ContentType.objects.get_for_model(Quiz)
    notifications = []

    prof = quiz.exercice.utilisateur
    prof_name = f"{prof.nom} {prof.prenom}" if prof else "un professeur"

    # ======================
    # 🎓 Étudiants
    # ======================
    etudiants = Utilisateur.objects.filter(etudiant__isnull=False)
    for etudiant in etudiants:
        notifications.append(
            Notification(
                utilisateur_destinataire=etudiant,
                utilisateur_envoyeur=prof,
                message_notif=f"Nouveau quiz public : {quiz.exercice.titre_exo}",
                content_type=content_type,
                object_id=quiz.pk,
                action_type="quiz_created",
                module_source="quiz",
                extra_data={
                    "titre_quiz": quiz.exercice.titre_exo,
                    "public": True
                }
            )
        )

    # ======================
    # 🛠️ Administrateurs
    # ======================
    admins = Administrateur.objects.all()
    for admin in admins:
        notifications.append(
            Notification(
                admin_destinataire=admin,
                utilisateur_envoyeur=prof,
                message_notif=(
                    f"Nouveau quiz créé par {prof_name} : "
                    f"{quiz.exercice.titre_exo}"
                ),
                content_type=content_type,
                object_id=quiz.pk,
                action_type="quiz_created",
                module_source="quiz",
                extra_data={
                    "titre_quiz": quiz.exercice.titre_exo,
                    "auteur": prof_name,
                    "public": True
                }
            )
        )

    Notification.objects.bulk_create(notifications)

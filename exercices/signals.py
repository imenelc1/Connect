# exercices/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Exercice
from feedback.models import Notification
from users.models import Utilisateur

@receiver(post_save, sender=Exercice)
def notify_students_on_exercice_create(sender, instance, created, **kwargs):
    if not created:
        return

    exercice = instance
    prof = exercice.utilisateur
    content_type = ContentType.objects.get_for_model(Exercice)
    notifications = []

    if exercice.visibilite_exo:  # public
        etudiants = Utilisateur.objects.filter(etudiant__isnull=False)
        for etudiant in etudiants:
            notifications.append(
                Notification(
                    message_notif=f"Nouveau exercice public : {exercice.titre_exo}",
                    utilisateur_destinataire=etudiant,
                    utilisateur_envoyeur=prof,
                    content_type=content_type,
                    object_id=exercice.pk,  # ← utilise pk ici
                    action_type="exercice_created",
                    module_source="exercice",
                    extra_data={"titre_exo": exercice.titre_exo, "public": True}
                )
            )
    else:
        print("🔒 Exercice privé, aucune notification envoyée")

    if notifications:
        Notification.objects.bulk_create(notifications)
        print(f"✅ {len(notifications)} notifications créées")

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Cours
from users.models import Utilisateur
from feedback.utils import create_notification

@receiver(post_save, sender=Cours)
def notify_new_cours(sender, instance, created, **kwargs):
    if not created:
        return

    cours = instance
    enseignant = cours.utilisateur

    if not enseignant:
        return

    # 🔹 Tous les étudiants
    etudiants = Utilisateur.objects.filter(
        etudiant__isnull=False
    )

    for etudiant in etudiants:
        try:
            create_notification(
                destinataire=etudiant,
                envoyeur=enseignant,
                content_object=cours,
                action_type='new_cours',
                module_source='cours',
                message=f"Nouveau cours publié : '{cours.titre_cour}'"
            )
        except Exception as e:
            print(f"Erreur notification cours ({etudiant.id_utilisateur}): {e}")

# exercices/management/commands/test_exercice_signals.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Cours
from exercices.models import Exercice
from feedback.models import Notification
import time

class Command(BaseCommand):
    help = 'Teste les signaux de notification pour les exercices'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("🧪 Test des signaux exercices..."))
        
        # Trouver ou créer un utilisateur test
        User = get_user_model()
        try:
            teacher = User.objects.filter(role='enseignant').first()
            if not teacher:
                teacher = User.objects.create_user(
                    email='test_teacher@example.com',
                    password='test123',
                    nom='Test',
                    prenom='Teacher',
                    role='enseignant'
                )
                self.stdout.write(f"   👨‍🏫 Enseignant créé: {teacher.email}")
        except:
            teacher = User.objects.first()
        
        # Trouver ou créer un cours
        cours = Cours.objects.first()
        if not cours:
            cours = Cours.objects.create(
                titre_cours="Cours test signaux",
                description="Pour tester les notifications",
                utilisateur=teacher
            )
            self.stdout.write(f"   📚 Cours créé: {cours.titre_cours}")
        
        # Compter les notifications avant
        before_count = Notification.objects.count()
        self.stdout.write(f"   📊 Notifications avant: {before_count}")
        
        # TEST 1: Création d'exercice
        self.stdout.write("\n1. Test création exercice...")
        exercice = Exercice.objects.create(
            titre_exo="Test Signal Notifications",
            enonce="Ceci est un exercice créé par commande de test",
            niveau_exo="intermediaire",
            categorie="Test",
            utilisateur=teacher,
            cours=cours,
            visibilite_exo=True
        )
        self.stdout.write(self.style.SUCCESS(f"   ✅ Exercice créé: {exercice.titre_exo}"))
        
        time.sleep(1)  # Laisser le temps au signal
        
        # TEST 2: Modification d'exercice
        self.stdout.write("\n2. Test modification exercice...")
        exercice.titre_exo = "Test Signal Notifications MODIFIÉ"
        exercice.niveau_exo = "avance"
        exercice.save()
        self.stdout.write(self.style.SUCCESS(f"   ✅ Exercice modifié"))
        
        time.sleep(1)
        
        # TEST 3: Dépublier l'exercice
        self.stdout.write("\n3. Test dépublication exercice...")
        exercice.visibilite_exo = False
        exercice.save()
        self.stdout.write(self.style.SUCCESS(f"   ✅ Exercice dépublié"))
        
        time.sleep(1)
        
        # Compter les notifications après
        after_count = Notification.objects.count()
        new_notifications = after_count - before_count
        
        self.stdout.write(self.style.SUCCESS(
            f"\n📈 Résultat: {new_notifications} nouvelle(s) notification(s) créée(s)"
        ))
        
        # Afficher les notifications créées
        new_notifs = Notification.objects.order_by('-date_envoie')[:new_notifications]
        
        for i, notif in enumerate(new_notifs, 1):
            self.stdout.write(f"\n   {i}. {notif.action_type}:")
            self.stdout.write(f"      📝 {notif.message_notif}")
            self.stdout.write(f"      👤 Pour: {notif.utilisateur_destinataire.email}")
            if notif.utilisateur_envoyeur:
                self.stdout.write(f"      👤 De: {notif.utilisateur_envoyeur.email}")
        
        self.stdout.write(self.style.SUCCESS("\n✅ Test terminé avec succès !"))
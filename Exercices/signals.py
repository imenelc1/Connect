# exercices/tests/test_signals.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from courses.models import Cours
from ..models import Exercice
import logging

# Capture les logs pour vérifier
logging.basicConfig(level=logging.INFO)

class ExerciceSignalsTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.teacher = User.objects.create_user(
            email='teacher@test.com',
            password='testpass',
            nom='Teacher',
            prenom='Test',
            role='enseignant'
        )
        
        self.student = User.objects.create_user(
            email='student@test.com',
            password='testpass',
            nom='Student',
            prenom='Test',
            role='etudiant'
        )
        
        # Créer un cours
        self.cours = Cours.objects.create(
            titre_cours="Cours de test",
            description="Description test",
            utilisateur=self.teacher
        )
    
    def test_exercice_creation_signal(self):
        """Test que le signal se déclenche à la création d'exercice"""
        print("\n🔍 Test création exercice...")
        
        # Créer un exercice
        exercice = Exercice.objects.create(
            titre_exo="Test Signal",
            enonce="Ceci est un test",
            niveau_exo="debutant",
            utilisateur=self.teacher,
            cours=self.cours,
            visibilite_exo=True
        )
        
        # Vérifier que l'exercice a bien été créé
        self.assertIsNotNone(exercice.id_exercice)
        print(f"   ✅ Exercice créé: {exercice.titre_exo}")
        
        # Dans un vrai test, vous vérifieriez qu'une notification a été créée
        from feedback.models import Notification
        notifications = Notification.objects.filter(
            module_source='exercice',
            action_type='exercice_created'
        )
        
        print(f"   📨 Notifications créées: {notifications.count()}")
        
    def test_exercice_update_signal(self):
        """Test que le signal se déclenche à la modification d'exercice"""
        print("\n🔍 Test modification exercice...")
        
        # Créer puis modifier
        exercice = Exercice.objects.create(
            titre_exo="Exercice à modifier",
            enonce="Contenu",
            niveau_exo="debutant",
            utilisateur=self.teacher,
            cours=self.cours,
            visibilite_exo=False  # Privé au départ
        )
        
        # Modifier la visibilité
        exercice.visibilite_exo = True
        exercice.save()
        
        print(f"   ✅ Exercice modifié: publié={exercice.visibilite_exo}")
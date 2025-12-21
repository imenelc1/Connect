from rest_framework import serializers

from courses.serializers import CoursSerializer
from exercices.serializers import ExerciceSerializer
from quiz.serializers import QuizSerializer, QuizSerializer1
from .models import Space, SpaceEtudiant, SpaceCour, SpaceExo, SpaceQuiz
from users.models import Utilisateur

# --- Serializer Utilisateur ---
class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id_utilisateur', 'prenom', 'nom', 'adresse_email']

# --- Serializer Space ---
class SpaceSerializer(serializers.ModelSerializer):
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Space
        fields = ['id_space', 'nom_space', 'description', 'date_creation', 'utilisateur', 'students_count']
        read_only_fields = ['id_space', 'utilisateur', 'date_creation']

    def get_students_count(self, obj):
        return obj.spaceetudiant_set.count()
    
# --- Serializer création SpaceEtudiant ---
class SpaceEtudiantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceEtudiant
        fields = ["etudiant", "space"]

# --- Serializer affichage SpaceEtudiant (nested) ---
class SpaceEtudiantDisplaySerializer(serializers.ModelSerializer):
    etudiant = UtilisateurSerializer(read_only=True)
    space = SpaceSerializer(read_only=True)

    class Meta:
        model = SpaceEtudiant
        fields = ["id", "etudiant", "space", "date_ajout"]

# --- Serializer SpaceCour ---
class SpaceCourSerializer(serializers.ModelSerializer):
    cours = CoursSerializer(read_only=True)

    class Meta:
        model = SpaceCour
        fields = ['id', 'space', 'cours', 'date_ajout']

# --- Serializer SpaceExo ---
class SpaceExoSerializer(serializers.ModelSerializer):
    exercice = ExerciceSerializer(read_only=True)

    class Meta:
        model = SpaceExo
        fields = ['id', 'space', 'exercice', 'date_ajout']

class SpaceQuizSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer1(read_only=True)  # ✅

    class Meta:
        model = SpaceQuiz
        fields = ['id', 'space', 'quiz', 'date_ajout']

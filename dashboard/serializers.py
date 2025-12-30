from django.utils import timezone
from rest_framework import serializers

from courses.models import Cours
from exercices.models import Exercice
from exercices.serializers import ExerciceSerializer
from spaces.serializers import UtilisateurSerializer
from .models import LeconComplete, ProgressionCours, ProgressionHistory, TentativeExercice

class LeconCompleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeconComplete
        fields = '__all__'

class ProgressionCoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressionCours
        fields = ['utilisateur', 'cours', 'avancement_cours', 'temps_passe', 'derniere_lecon', 'created_at']
        
class CoursSerializer(serializers.ModelSerializer):
    niveau_cour_label = serializers.CharField(source='niveau_cour.label', read_only=True)

    class Meta:
        model = Cours
        fields = ['id', 'titre_cour', 'description', 'niveau_cour_label', 'utilisateur_name', 'duration_readable']


class CoursProgressSerializer(serializers.ModelSerializer):
    progress = serializers.FloatField(source='avancement_cours')
    cours = CoursSerializer(read_only=True)

    class Meta:
        model = ProgressionCours
        fields = ['cours', 'progress']


class ProgressionHistorySerializer(serializers.ModelSerializer):
    day = serializers.SerializerMethodField()

    class Meta:
        model = ProgressionHistory
        fields = ["avancement", "temps_passe", "created_at", "day"]

    def get_day(self, obj):
        return obj.created_at.strftime("%Y-%m-%d")

# Lecture
class TentativeExerciceReadSerializer(serializers.ModelSerializer):
    exercice = ExerciceSerializer(read_only=True)
    utilisateur = UtilisateurSerializer(read_only=True)

    class Meta:
        model = TentativeExercice
        fields = ['id', 'etat', 'feedback', 'reponse', 'output', 'exercice', 'utilisateur', 'submitted_at', 'created_at']

# Écriture
class TentativeExerciceWriteSerializer(serializers.ModelSerializer):
    exercice_id = serializers.PrimaryKeyRelatedField(
        queryset=Exercice.objects.all(),
        write_only=True,
        source='exercice'
    )

    class Meta:
        model = TentativeExercice
        fields = [
            "exercice_id", "reponse", "output", "etat", "temps_passe"
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        exercice = validated_data.pop('exercice')
        validated_data['utilisateur'] = user

        if validated_data.get("etat") == "soumis":
            validated_data["submitted_at"] = timezone.now()

        tentative, created = TentativeExercice.objects.update_or_create(
            utilisateur=user,
            exercice=exercice,
            defaults=validated_data
        )
        return tentative


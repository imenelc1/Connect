from rest_framework import serializers

from courses.models import Cours
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

from rest_framework import serializers

from courses.models import Cours
from .models import LeconComplete, ProgressionCours, TentativeExercice

class LeconCompleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeconComplete
        fields = '__all__'

class ProgressionCoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressionCours
        fields = ['utilisateur', 'cours', 'avancement_cours', 'temps_passe']
        
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

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

class CoursProgressSerializer(serializers.ModelSerializer):
    progress = serializers.FloatField(source='avancement_cours')

    class Meta:
        model = ProgressionCours
        fields = ['cours', 'progress']
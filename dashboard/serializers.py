from rest_framework import serializers
from .models import Badge, GagnerBadge, ProgressionCours, TentativeExercice, Analyse

class ProgressionCoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressionCours
        fields = '__all__'

class TentativeExerciceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TentativeExercice
        fields = '__all__'

class AnalyseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analyse
        fields = '__all__'

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'nom', 'description', 'icone', 'condition']

class GagnerBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)  # nested serializer pour info du badge

    class Meta:
        model = GagnerBadge
        fields = ['badge', 'date_obtention']

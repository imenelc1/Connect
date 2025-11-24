from rest_framework import serializers
from .models import Exercice

class ExerciceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercice
        fields = '__all__'

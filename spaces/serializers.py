from rest_framework import serializers
from .models import Space, SpaceEtudiant, SpaceCour, SpaceExo

class SpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Space
        fields = '__all__'

class SpaceEtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceEtudiant
        fields = '__all__'

class SpaceCourSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceCour
        fields = '__all__'

class SpaceExoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceExo
        fields = '__all__'

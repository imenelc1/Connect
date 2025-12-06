from rest_framework import serializers
from .models import Space, SpaceEtudiant, SpaceCour, SpaceExo
from users.models import Utilisateur  # ton modèle utilisateur

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id_utilisateur', 'prenom', 'nom', 'adresse_email']

class SpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Space
        fields = ['id_space', 'nom_space', 'description', 'date_creation', 'utilisateur']
        read_only_fields = ['id_space', 'utilisateur', 'date_creation']

class SpaceEtudiantSerializer(serializers.ModelSerializer):
    etudiant = UtilisateurSerializer(read_only=True)  # nested serializer
    space = SpaceSerializer(read_only=True)           # nested serializer

    class Meta:
        model = SpaceEtudiant
        fields = ['id', 'etudiant', 'space', 'date_ajout']

class SpaceCourSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceCour
        fields = '__all__'

class SpaceExoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceExo
        fields = '__all__'

from rest_framework import serializers
from .models import Space, SpaceEtudiant, SpaceCour, SpaceExo
from users.models import Utilisateur

# --- Serializer Utilisateur ---
class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id_utilisateur', 'prenom', 'nom', 'adresse_email']

# --- Serializer Space ---
class SpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Space
        fields = ['id_space', 'nom_space', 'description', 'date_creation', 'utilisateur']
        read_only_fields = ['id_space', 'utilisateur', 'date_creation']

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
    class Meta:
        model = SpaceCour
        fields = '__all__'

# --- Serializer SpaceExo ---
class SpaceExoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceExo
        fields = '__all__'

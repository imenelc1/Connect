from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Utilisateur, Etudiant, Enseignant, Administrateur

class UtilisateurSerializer(serializers.ModelSerializer):
    adresse_email = serializers.EmailField(
        validators=[UniqueValidator(queryset=Utilisateur.objects.all())]
    )

    class Meta:
        model = Utilisateur
        fields = ['id_utilisateur', 'nom', 'prenom', 'date_naissance', 'adresse_email', 'mot_de_passe', 'matricule']
        extra_kwargs = {
            'mot_de_passe': {'write_only': True, 'min_length': 8}
        }

class EtudiantSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer() #serializer pour inclure les détails de l'utilisateur

    class Meta:
        model = Etudiant
        fields = ['utilisateur', 'specialite', 'annee_etude']

class EnseignantSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()

    class Meta:
        model = Enseignant
        fields = ['utilisateur', 'grade']

class AdministrateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrateur
        fields = ['id_admin', 'email_admin', 'mdp_admin']
        extra_kwargs = {
            'mdp_admin': {'write_only': True, 'min_length': 8}
        }

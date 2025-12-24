from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Utilisateur, Etudiant, Enseignant, Administrateur


class UtilisateurSerializer(serializers.ModelSerializer):
    mot_de_passe = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = Utilisateur
        fields = [
            'id_utilisateur', 'nom', 'prenom', 'date_naissance',
            'adresse_email', 'mot_de_passe', 'matricule'
        ]
   
    def create(self, validated_data):
        mot_de_passe = validated_data.pop('mot_de_passe')
        user = Utilisateur(**validated_data)
        user.set_password(mot_de_passe)
        user.save()
        return user


class EtudiantSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()

    class Meta:
        model = Etudiant
        fields = ['utilisateur', 'specialite', 'annee_etude']


class EnseignantSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()

    class Meta:
        model = Enseignant
        fields = ['utilisateur', 'grade']


class AdministrateurSerializer(serializers.ModelSerializer):
    mdp_admin = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Administrateur
        fields = ['id_admin', 'email_admin', 'mdp_admin']

    def create(self, validated_data):
        admin = Administrateur(email_admin=validated_data['email_admin'])
        admin.set_password(validated_data['mdp_admin'])
        admin.save()
        return admin
    
class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    grade = serializers.SerializerMethodField()
    specialite = serializers.SerializerMethodField()
    annee_etude = serializers.SerializerMethodField()

    class Meta:
        model = Utilisateur
        fields = [
            'id_utilisateur', 'nom', 'prenom', 'date_naissance',
            'adresse_email', 'matricule', 'role', 'grade', 'specialite', 'annee_etude'
        ]

    def get_role(self, obj):
        if hasattr(obj, "etudiant"):
            return "etudiant"
        elif hasattr(obj, "enseignant"):
            return "enseignant"
        elif hasattr(obj, "administrateur"):
            return "admin"
        return None

    def get_grade(self, obj):
        return getattr(getattr(obj, "enseignant", None), "grade", None)

    def get_specialite(self, obj):
        return getattr(getattr(obj, "etudiant", None), "specialite", None)

    def get_annee_etude(self, obj):
        return getattr(getattr(obj, "etudiant", None), "annee_etude", None)

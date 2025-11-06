from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Utilisateur

class UtilisateurSerializer(serializers.ModelSerializer):
    adresse_email = serializers.EmailField(
        validators=[UniqueValidator(queryset=Utilisateur.objects.all())] # Assure l’unicité de l’adresse email
    )

    class Meta:
        model = Utilisateur
        fields = ['id_utilisateur', 'nom', 'prenom', 'date_naissance', 'adresse_email', 'mot_de_passe', 'matricule']
        extra_kwargs = {
            'mot_de_passe': {'write_only': True, 'min_length': 8} # Le mot de passe n’est pas renvoyé dans les réponses et doit faire au moins 8 caractères
        }

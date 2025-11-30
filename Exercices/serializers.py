from rest_framework import serializers
from .models import Exercice

"""class ExerciceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercice
        fields = '__all__'"""


class ExerciceSerializer(serializers.ModelSerializer):
    niveau_exercice_label = serializers.CharField(source='get_niveau_exo_display', read_only=True)

    utilisateur = serializers.SerializerMethodField()

    class Meta:
        model = Exercice
        fields = ['id_exercice', 'titre_exo', 'niveau_exo', 'niveau_exercice_label',
                  'enonce', 'categorie',  'utilisateur','cours', 'visibilite_exo']

    def get_utilisateur(self, obj):
        return f"{obj.utilisateur.nom} {obj.utilisateur.prenom}"
    
    def get_cours(self, obj):
        return f"{obj.cours.titre_cours} " 

  
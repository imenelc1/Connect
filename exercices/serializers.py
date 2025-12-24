from rest_framework import serializers
from .models import Exercice

class ExerciceSerializer1(serializers.ModelSerializer):
    class Meta:
        model = Exercice
        fields = ['id_exercice', 'titre_exo', 'niveau_exo', 'visibilite_exo', 'enonce', 'categorie', 'utilisateur', 'cours']


class ExerciceSerializer(serializers.ModelSerializer):
    niveau_exercice_label = serializers.CharField(source='get_niveau_exo_display', read_only=True)
    visibilite_exo_label = serializers.SerializerMethodField()
    utilisateur_name = serializers.SerializerMethodField()

    class Meta:
        model = Exercice
        fields = ['id_exercice', 'titre_exo', 'niveau_exo', 'niveau_exercice_label',
                  'enonce', 'categorie',  'utilisateur', 'utilisateur_name', 'cours', 'visibilite_exo', 'visibilite_exo_label']

    def get_utilisateur_name(self, obj):
     if obj.utilisateur:
        return f"{obj.utilisateur.nom} {obj.utilisateur.prenom}"
     return "Inconnu"

    def get_cours(self, obj):
     if obj.cours:
        return obj.cours.titre_cour
     return ""
 
    def get_visibilite_exo_label(self, obj):
        return "public" if obj.visibilite_exo else "private"
    

  
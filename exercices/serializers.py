from urllib import request
from rest_framework import serializers

from dashboard.models import TentativeExercice
from .models import Exercice

class ExerciceSerializer1(serializers.ModelSerializer):
    class Meta:
        model = Exercice
        fields = [
            'id_exercice',
            'titre_exo',
            'niveau_exo',
            'visibilite_exo',
            'enonce',
            'solution',
            'categorie',
            'utilisateur',
            'cours',
            'max_soumissions',
        ]


class ExerciceSerializer(serializers.ModelSerializer):
    niveau_exercice_label = serializers.CharField(
        source='get_niveau_exo_display',
        read_only=True
    )
    visibilite_exo_label = serializers.SerializerMethodField()
    utilisateur_name = serializers.SerializerMethodField()

    class Meta:
        model = Exercice
        fields = [
            'id_exercice',
            'titre_exo',
            'niveau_exo',
            'niveau_exercice_label',
            'enonce',
            'solution',
            'categorie',
            'utilisateur',
            'utilisateur_name',
            'cours',
            'visibilite_exo',
            'visibilite_exo_label',
            'max_soumissions', 
        ]

    def get_utilisateur_name(self, obj):
        if obj.utilisateur:
            return f"{obj.utilisateur.nom} {obj.utilisateur.prenom}"
        return "Inconnu"

    def get_visibilite_exo_label(self, obj):
        return "public" if obj.visibilite_exo else "private"

    def get_solution(self, obj):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return None

        user = request.user

        # le prof voit toujours la solution
        if obj.utilisateur == user:
            return obj.solution

        # l’étudiant voit la solution s’il a AU MOINS une tentative
        tentative = TentativeExercice.objects.filter(
            exercice=obj,
            utilisateur=user
        ).first()

        if tentative:
            return obj.solution

        # sinon
        return None



  
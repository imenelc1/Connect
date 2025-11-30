from rest_framework import serializers
from .models import Cours, Section, Lecon


class CoursSerializer(serializers.ModelSerializer):
    niveau_cour_label = serializers.CharField(source='get_niveau_cour_display', read_only=True)
    utilisateur = serializers.SerializerMethodField()
    duration_readable = serializers.SerializerMethodField()

    class Meta:
        model = Cours
        fields = ['id_cours', 'titre_cour', 'niveau_cour', 'niveau_cour_label',
                  'description', 'duration', 'duration_readable', 'utilisateur']

    def get_utilisateur(self, obj):
        return f"{obj.utilisateur.nom} {obj.utilisateur.prenom}"

    def get_duration_readable(self, obj):
        total_seconds = obj.duration.total_seconds()
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        return f"{hours}h {minutes}m"



class CoursSerializer1(serializers.ModelSerializer):
    class Meta:
        model = Cours
        fields = ['id_cours', 'titre_cour', 'niveau_cour', 'visibilite_cour', 'description', 'duration', 'utilisateur']


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id_section', 'cours', 'titre_section', 'ordre']

class LeconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecon
        fields = '__all__'

"""

"""
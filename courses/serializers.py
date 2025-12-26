from rest_framework import serializers
from .models import Cours, Section, Lecon


class CoursSerializer(serializers.ModelSerializer):
    niveau_cour_label = serializers.CharField(source='get_niveau_cour_display', read_only=True)
    utilisateur_name = serializers.SerializerMethodField()
    duration_readable = serializers.SerializerMethodField()

    class Meta:
        model = Cours
        fields = ['id_cours', 'titre_cour', 'niveau_cour', 'niveau_cour_label',
                  'description', 'duration', 'duration_readable', 'utilisateur_name', 'utilisateur', 'visibilite_cour']

    def get_utilisateur_name(self, obj):
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
        fields = ['id_section', 'cours', 'titre_section', 'ordre' , 'description']

class LeconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecon
        fields = '__all__'

"""

"""


# Ajout du champ visited à ton LessonSerializer1
class LessonSerializer1(serializers.ModelSerializer):
    visited = serializers.SerializerMethodField()

    class Meta:
        model = Lecon
        fields = ['id_lecon', 'titre_lecon', 'contenu_lecon', 'type_lecon', 'ordre', 'visited']

    def get_visited(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.leconcomplete_set.filter(utilisateur=request.user).exists()


class SectionSerializer1(serializers.ModelSerializer):
    lecons = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['id_section', 'titre_section', 'description', 'ordre', 'lecons']

    def get_lecons(self, obj):
        # On transmet le context ici pour que visited fonctionne
        return LessonSerializer1(obj.lecons.all(), many=True, context=self.context).data


class CourseSerializer2(serializers.ModelSerializer):
    sections = serializers.SerializerMethodField()

    class Meta:
        model = Cours
        fields = ['id_cours', 'titre_cour', 'description', 'duration', 'niveau_cour', 'sections', 'visibilite_cour']

    def get_sections(self, obj):
        # On transmet le context aux sections imbriquées
        return SectionSerializer1(obj.sections.all(), many=True, context=self.context).data


class LeconNestedSerializer(serializers.ModelSerializer):
    id_lecon = serializers.IntegerField(required=False)
    
    class Meta:
        model = Lecon
        fields = ['id_lecon', 'titre_lecon', 'contenu_lecon', 'type_lecon', 'ordre']

class SectionNestedSerializer(serializers.ModelSerializer):
    id_section = serializers.IntegerField(required=False)
    lecons = LeconNestedSerializer(many=True)
    
    class Meta:
        model = Section
        fields = ['id_section', 'titre_section', 'description', 'ordre', 'lecons']

class CourseUpdateSerializer(serializers.ModelSerializer):
    sections = SectionNestedSerializer(many=True)
    
    class Meta:
        model = Cours
        fields = ['id_cours', 'titre_cour', 'description', 'duration', 'niveau_cour', 'sections', 'visibilite_cour']
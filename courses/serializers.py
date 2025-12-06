from rest_framework import serializers
from .models import Cours, Section, Lecon


class CoursSerializer(serializers.ModelSerializer):
    niveau_cour_label = serializers.CharField(source='get_niveau_cour_display', read_only=True)
    utilisateur_name = serializers.SerializerMethodField()
    duration_readable = serializers.SerializerMethodField()

    class Meta:
        model = Cours
        fields = ['id_cours', 'titre_cour', 'niveau_cour', 'niveau_cour_label',
                  'description', 'duration', 'duration_readable', 'utilisateur_name', 'utilisateur']

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


class LessonSerializer1(serializers.ModelSerializer):
    class Meta:
        model = Lecon
        fields = ['id_lecon', 'titre_lecon', 'contenu_lecon', 'type_lecon']



class SectionSerializer1(serializers.ModelSerializer):
    lecons = LessonSerializer1(many=True)  # ⚡ nested

    class Meta:
        model = Section
        fields = ['id_section', 'titre_section', 'description', 'lecons']
        
    
    
class CourseSerializer2(serializers.ModelSerializer):
    sections = SectionSerializer1(many=True)  # ⚡ nested

    class Meta:
        model = Cours
        fields = ['id_cours', 'titre_cour', 'description', 'duration', 'niveau_cour', 'sections']
        
        
        





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
        fields = ['id_cours', 'titre_cour', 'description', 'duration', 'niveau_cour', 'sections']

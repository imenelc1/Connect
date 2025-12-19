from rest_framework import serializers
from .models import Question, Option, Quiz
from exercices.serializers import ExerciceSerializer


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = '__all__'

    def validate_question(self, value):
        if value is None:
            raise serializers.ValidationError("Une option doit être liée à une question.")
        return value


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id_qst', 'texte_qst', 'reponse_correcte', 'score', 'options', 'exercice']

    # Validation pour s'assurer que l'exercice est fourni
    def validate_exercice(self, value):
        if value is None:
            raise serializers.ValidationError("L'exercice est obligatoire pour une question.")
        return value


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'


class QuizSerializer1(serializers.ModelSerializer):
    exercice = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()
    class Meta:
        model = Quiz
        fields = ['id', 'scoreMinimum', 'duration', 'duration_minutes', 'activerDuration', 'nbMax_tentative', 'exercice', 'questions']

    def get_exercice(self, obj):
        # Utilisation de ton serializer complet ExerciceSerializer1
        return ExerciceSerializer(obj.exercice).data

        
    def get_questions(self, obj):
        questions = obj.exercice.questions.all()  # FK de Question vers Exercice
        return QuestionSerializer(questions, many=True).data
    def get_duration_minutes(self, obj):
        if obj.duration:
            total_seconds = obj.duration.total_seconds()  # convertir duration en secondes
            minutes = int(total_seconds // 60)  # convertir en minutes
            return minutes
        return None
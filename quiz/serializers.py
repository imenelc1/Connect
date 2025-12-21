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
    exercice = ExerciceSerializer()  # inclut id_exercice, titre_exo, etc.

    class Meta:
        model = Quiz
        fields = ['id', 'exercice', 'scoreMinimum', 'duration']

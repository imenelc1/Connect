from rest_framework import serializers
from .models import Question, Option, Quiz
from Exercices.serializers import ExerciceSerializer

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'


class QuizSerializer1(serializers.ModelSerializer):
    exercice = ExerciceSerializer(read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'scoreMinimum', 'exercice']

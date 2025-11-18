from rest_framework import serializers
from .models import Cours, Section, Lecon, Exercice, Question, Option, Quiz

class CoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cours
        fields = 'all'

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = 'all'

class LeconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecon
        fields = 'all'

class ExerciceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercice
        fields = 'all'
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = 'all'
class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = 'all'
class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = 'all'

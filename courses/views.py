from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Cours, Section, Lecon, Exercice, Quiz, Question, Option
from .serializers import CoursSerializer, SectionSerializer, LeconSerializer, ExerciceSerializer, QuizSerializer, QuestionSerializer, OptionSerializer

# Liste + Création
class CoursListCreateView(generics.ListCreateAPIView):
    queryset = Cours.objects.all()
    serializer_class = CoursSerializer

# Détail, modification, suppression
class CoursDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cours.objects.all()
    serializer_class = CoursSerializer

class SectionListCreateView(generics.ListCreateAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

class LeconListCreateView(generics.ListCreateAPIView):
    queryset = Lecon.objects.all()
    serializer_class = LeconSerializer

class ExerciceListCreateView(generics.ListCreateAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer

# Détail, modification, suppression
class ExerciceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer

class QuizListCreateView(generics.ListCreateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

# Détail, modification, suppression
class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

# Détail, modification, suppression
class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class OptionListCreateView(generics.ListCreateAPIView):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer

# Détail, modification, suppression
class OptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer

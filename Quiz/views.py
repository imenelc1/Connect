from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from exercices.models import Exercice

# Create your views here.
from rest_framework import generics
from .models import Quiz, Question, Option
from .serializers import QuestionSerializer, QuizSerializer, QuizSerializer1,  OptionSerializer

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
    
    

@api_view(['GET'])
def Quiz_list_api(request):
    quiz = Quiz.objects.all()
    serializer = QuizSerializer1(quiz, many=True)
    return Response(serializer.data)


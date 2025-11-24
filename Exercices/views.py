from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Exercice
from .serializers import  ExerciceSerializer



class ExerciceListCreateView(generics.ListCreateAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer

# Détail, modification, suppression
class ExerciceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer
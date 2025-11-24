from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Cours, Section, Lecon
from .serializers import CoursSerializer, SectionSerializer, LeconSerializer
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
    
# Détail, modification, suppression
class SectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    
    
class LeconListCreateView(generics.ListCreateAPIView):
    queryset = Lecon.objects.all()
    serializer_class = LeconSerializer

# Détail, modification, suppression
class LeconDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lecon.objects.all()
    serializer_class = LeconSerializer


""""""
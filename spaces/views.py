from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Space, SpaceEtudiant, SpaceCour, SpaceExo
from .serializers import SpaceSerializer, SpaceEtudiantSerializer, SpaceCourSerializer, SpaceExoSerializer

# --- Views pour API ---
class SpaceViewSet(viewsets.ModelViewSet):
    queryset = Space.objects.all()
    serializer_class = SpaceSerializer

class SpaceEtudiantViewSet(viewsets.ModelViewSet):
    queryset = SpaceEtudiant.objects.all()
    serializer_class = SpaceEtudiantSerializer

class SpaceCourViewSet(viewsets.ModelViewSet):
    queryset = SpaceCour.objects.all()
    serializer_class = SpaceCourSerializer

class SpaceExoViewSet(viewsets.ModelViewSet):
    queryset = SpaceExo.objects.all()
    serializer_class = SpaceExoSerializer

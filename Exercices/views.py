from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Exercice
from .serializers import  ExerciceSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def Exercice_list_api(request):
    exercice = Exercice.objects.all()
    serializer = ExerciceSerializer(exercice, many=True)
    return Response(serializer.data)




class ExerciceListCreateView(generics.ListCreateAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer

# Détail, modification, suppression
class ExerciceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer
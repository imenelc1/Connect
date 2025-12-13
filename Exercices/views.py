from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Exercice
from .serializers import  ExerciceSerializer, ExerciceSerializer1
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.jwt_auth import jwt_required
from rest_framework.views import APIView
from rest_framework import status


class CreateExoView(APIView):

    @jwt_required
    def post(self, request):
        data = request.data.copy()
        data["utilisateur"] = request.user_id  # 🟩 automatique, sécurisé

        serializer = ExerciceSerializer1(data=data)

        if serializer.is_valid():
            exercice = serializer.save()
            return Response(ExerciceSerializer1(exercice).data, status=201)

        return Response(serializer.errors, status=400)





@api_view(['GET'])
def Exercice_list_api(request):
    exercice = Exercice.objects.filter(visibilite_exo=True).exclude(quiz__isnull=False)
    serializer = ExerciceSerializer(exercice, many=True)
    return Response(serializer.data)




class ExerciceListCreateView(generics.ListCreateAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer

# Détail, modification, suppression
class ExerciceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer
    

@api_view (['DELETE'])
def delete_exercice(request, pk):
    try:
        exercice= Exercice.objects.get(pk=pk)
        exercice.delete()
        return Response({"message": "deleted"}, status=204)
    except Exercice.DoesNotExist:
        return Response({"error": "not found"}, status=404)
    
    
    
"""class ExerciceeDetailView(generics.RetrieveAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer
    lookup_field = "pk"
    """




class ExerciceParCoursView(APIView):
    def get(self, request, cours_id):
        exercices = Exercice.objects.filter(cours_id=cours_id, visibilite_exo=True).exclude(quiz__isnull=False)
        serializer = ExerciceSerializer(exercices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
from django.shortcuts import render
from django.db.models import Q
# Create your views here.
from rest_framework import generics
from .models import Exercice
from .serializers import  ExerciceSerializer, ExerciceSerializer1
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.jwt_auth import jwt_required
from rest_framework.views import APIView
from rest_framework import status
from feedback.models import Notification
from courses.models import Cours  

class CreateExoView(APIView):
    @jwt_required
    def post(self, request):
        data = request.data.copy()
        user = request.user

        # Vérifier le cours
        cours_id = data.get("cours")
        try:
            cours = Cours.objects.get(id_cours=cours_id)
        except Cours.DoesNotExist:
            return Response({"error": "Cours introuvable"}, status=404)

        # Vérification de permission
        if (cours.utilisateur != user) and not getattr(user.enseignant, "can_create_any_course_content", False):
            return Response({"error": "Vous n'avez pas le droit de créer un exercice pour ce cours"}, status=403)

        # Ajouter l'utilisateur pour le serializer
        data["utilisateur"] = user.id_utilisateur

        serializer = ExerciceSerializer1(data=data)
        if serializer.is_valid():
            exo = serializer.save()
            return Response(ExerciceSerializer1(exo).data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
def Exercice_list_api(request):
    exercice = Exercice.objects.filter().exclude(categorie="quiz")
    serializer = ExerciceSerializer(exercice, many=True)
    return Response(serializer.data)





class ExerciceListCreateView(generics.ListCreateAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# Détail, modification, suppression
class ExerciceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

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
        exercices = Exercice.objects.filter(
            cours_id=cours_id,
            visibilite_exo=True
        ).exclude(categorie="quiz")

        serializer = ExerciceSerializer(
            exercices,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
        exercices = Exercice.objects.filter(cours_id=cours_id).exclude(categorie="quiz")
        serializer = ExerciceSerializer(exercices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
#Recherche exercice par titre, enonce, categorie
class ExerciceSearchAPIView(APIView):
    """
    Retourne les exercices filtrés par titre, énoncé ou catégorie.
    """

    def get(self, request):
        search = request.GET.get("search", "").strip()
        categorie = request.GET.get("categorie", "").strip()

        exercices = Exercice.objects.filter(quiz__isnull=True)

        if search:
            exercices = exercices.filter(
                Q(titre_exo__icontains=search) |
                Q(enonce__icontains=search)
            )

        if categorie:
            exercices = exercices.filter(categorie__icontains=categorie).exclude(categorie="quiz")

        serializer = ExerciceSerializer(exercices, many=True)
        return Response(serializer.data)

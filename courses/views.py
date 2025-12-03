from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
# Create your views here.
from rest_framework import generics, viewsets, permissions
from .models import Cours, Section, Lecon
from .serializers import CoursSerializer, SectionSerializer, LeconSerializer, CoursSerializer1
from users.jwt_auth import jwt_required
from rest_framework.views import APIView

class CreateCoursView(APIView):

    @jwt_required
    def post(self, request):
        data = request.data.copy()
        data["utilisateur"] = request.user_id  # 🟩 automatique, sécurisé

        serializer = CoursSerializer1(data=data)

        if serializer.is_valid():
            cours = serializer.save()
            return Response(CoursSerializer1(cours).data, status=201)

        return Response(serializer.errors, status=400)



class CreateSectionView(APIView):

    @jwt_required
    def post(self, request):
        data = request.data.copy()
        serializer = SectionSerializer(data=data)
        if serializer.is_valid():
            section = serializer.save()
            return Response({
                'id': section.id_section,  # 🟢 ID pour le front
                'titre_section': section.titre_section,
                'description': section.description,
                'ordre': section.ordre
            }, status=201)
        return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def delete_cours(request, pk):
    
    
    try:
        cours = Cours.objects.get(pk=pk)
        cours.delete()
        return Response({"message": "deleted"}, status=204)
    except Cours.DoesNotExist:
        return Response({"error": "not found"}, status=404)


class CreateLeconView(APIView):

    @jwt_required
    def post(self, request):
        data = request.data.copy()

        # --- Assurer que l'utilisateur est renseigné ---
        data["utilisateur"] = request.user_id

        # --- Champs obligatoires ---
        if "section" not in data or not data["section"]:
            return Response({"section": "Ce champ est obligatoire."}, status=400)
        
        # Vérifier que la section existe
        try:
            section = Section.objects.get(pk=data["section"])
        except Section.DoesNotExist:
            return Response({"section": "Section introuvable."}, status=404)

        # Valeurs par défaut
        if "type_lecon" not in data or not data["type_lecon"]:
            data["type_lecon"] = "text"
        if "contenu_lecon" not in data:
            data["contenu_lecon"] = ""
        if "ordre" not in data or not data["ordre"]:
            data["ordre"] = 1

        serializer = LeconSerializer(data=data)
        if serializer.is_valid():
            lecon = serializer.save()
            return Response(LeconSerializer(lecon).data, status=201)
        else:
            # 🔹 Debug: afficher les erreurs dans la console
            print("Erreur création leçon :", serializer.errors)
            return Response(serializer.errors, status=400)




@api_view(['GET'])
def cours_list_api(request):
    cours = Cours.objects.all()
    serializer = CoursSerializer(cours, many=True)
    return Response(serializer.data)

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

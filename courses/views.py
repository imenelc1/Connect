from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
# Create your views here.
from rest_framework import generics, viewsets, permissions
from .models import Cours, Section, Lecon
from .serializers import CoursSerializer, CourseSerializer2, SectionSerializer, LeconSerializer, CoursSerializer1
from users.jwt_auth import jwt_required
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from datetime import timedelta
import os

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
    parser_classes = [MultiPartParser, FormParser]  # <- ajouter ça pour les fichiers

    @jwt_required
    def post(self, request):
        data = request.data.copy()
        data["utilisateur"] = request.user_id

        # Vérifier la section
        if "section" not in data or not data["section"]:
            return Response({"section": "Ce champ est obligatoire."}, status=400)
        
        try:
            section = Section.objects.get(pk=data["section"])
        except Section.DoesNotExist:
            return Response({"section": "Section introuvable."}, status=404)

        # Valeurs par défaut
        data["type_lecon"] = data.get("type_lecon", "text")
        data["ordre"] = data.get("ordre", 1)

        # --- Gestion du fichier image ---
        if data["type_lecon"] == "image" and "image_lecon" in request.FILES:
            file = request.FILES["image_lecon"]
            save_path = os.path.join("lecons", file.name)
            full_path = os.path.join(settings.MEDIA_ROOT, save_path)

            # Sauvegarde du fichier sur le serveur
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "wb+") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # Stocker le chemin relatif dans contenu_lecon
            data["contenu_lecon"] = save_path
        else:
            data["contenu_lecon"] = data.get("contenu_lecon", "")

        serializer = LeconSerializer(data=data)
        if serializer.is_valid():
            lecon = serializer.save()
            return Response(LeconSerializer(lecon).data, status=201)
        else:
            print("Erreur création leçon :", serializer.errors)
            return Response(serializer.errors, status=400)


class UpdateLeconView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    @jwt_required
    def put(self, request, *args, **kwargs):
        lecon_id = kwargs.get("pk")  # <-- récupérer le pk depuis kwargs
        if not lecon_id:
            return Response({"detail": "Leçon introuvable."}, status=400)

        try:
            lecon = Lecon.objects.get(pk=lecon_id)
        except Lecon.DoesNotExist:
            return Response({"detail": "Leçon introuvable."}, status=404)

        data = request.data.copy()
        data["utilisateur"] = request.user_id

        # Vérifier la section
        if "section" not in data or not data["section"]:
            return Response({"section": "Ce champ est obligatoire."}, status=400)
        
        try:
            section = Section.objects.get(pk=data["section"])
        except Section.DoesNotExist:
            return Response({"section": "Section introuvable."}, status=404)

        # Valeurs par défaut
        data["type_lecon"] = data.get("type_lecon", lecon.type_lecon)
        data["ordre"] = data.get("ordre", lecon.ordre)

        # Gestion du fichier image
        if data["type_lecon"] == "image" and "image_lecon" in request.FILES:
            file = request.FILES["image_lecon"]
            save_path = os.path.join("lecons", file.name)
            full_path = os.path.join(settings.MEDIA_ROOT, save_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "wb+") as f:
                for chunk in file.chunks():
                    f.write(chunk)
            data["contenu_lecon"] = save_path
        elif data["type_lecon"] != "image":
            data["contenu_lecon"] = data.get("contenu_lecon", lecon.contenu_lecon)
        else:
            data["contenu_lecon"] = lecon.contenu_lecon

        serializer = LeconSerializer(lecon, data=data)
        if serializer.is_valid():
            lecon = serializer.save()
            return Response(LeconSerializer(lecon).data, status=200)
        else:
            print("Erreur mise à jour leçon :", serializer.errors)
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
class CourseDetailView(generics.RetrieveAPIView):
    queryset = Cours.objects.all()
    serializer_class = CourseSerializer2
    lookup_field = "pk"



    

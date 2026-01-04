from django.shortcuts import render,get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
# Create your views here.
from rest_framework import generics, viewsets, permissions
from feedback.models import Notification;
import courses
from dashboard.models import LeconComplete, ProgressionCours
from users.models import Utilisateur
from .models import Cours, Section, Lecon
from .serializers import CoursSerializer, CourseSerializer2, SectionSerializer, LeconSerializer, CoursSerializer1
from users.jwt_auth import IsAuthenticatedJWT, jwt_required
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from datetime import datetime, timedelta
import os
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q
from dashboard.models import ActivityEvent
def log_activity(user, event_type):
    """
    Crée un événement d'activité pour l'utilisateur
    seulement si ce type d'événement n'a pas encore été enregistré aujourd'hui.
    """
    today = datetime.now().date()
    if not ActivityEvent.objects.filter(
        user=user,
        event_type=event_type,
        created_at__date=today
    ).exists():
        ActivityEvent.objects.create(user=user, event_type=event_type)
class CreateCoursView(APIView):

    @jwt_required
    def post(self, request):
        data = request.data.copy()
        data["utilisateur"] = request.user_id 

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
class CoursDetailView(generics.RetrieveUpdateAPIView):
    queryset = Cours.objects.all()
    serializer_class = CourseSerializer2
    lookup_field = "pk"

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)  # fait la mise à jour du cours

        # --- Création de la notif pour l'enseignant ---
        cours = self.get_object()
        enseignant = cours.utilisateur
        if request.user.is_staff and enseignant:
            Notification.objects.create(
                utilisateur_destinataire=enseignant,
                action_type='course_updated_by_admin',
                module_source='courses',
                message_notif=f"📢 Les informations de votre cours '{cours.titre_cour}' ont été modifié par un administrateur."
            )

        return response
    def destroy(self, request, *args, **kwargs):
        # Récupère le cours AVANT de le supprimer
        cours = self.get_object()
        enseignant = cours.utilisateur
        cours_titre = cours.titre_cour

        # Crée la notif uniquement si l'utilisateur est staff et qu'un enseignant est assigné
        if request.user.is_staff and enseignant:
            Notification.objects.create(
                utilisateur_destinataire=enseignant,
                action_type='course_deleted_by_admin',
                module_source='courses',
                message_notif=f"❌ Votre cours '{cours_titre}' a été supprimé par un administrateur."
            )

        # Supprime le cours et retourne la réponse
        return super().destroy(request, *args, **kwargs)



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



class CoursesWithProgressView(APIView):
    @jwt_required
    def get(self, request):
        try:
            user_id = request.user_id
            user = Utilisateur.objects.get(pk=user_id)
        except Utilisateur.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable."}, status=404)

        courses = Cours.objects.all()
        data = []

        # Mapping pour normaliser les niveaux
        NIVEAUX_MAP = {
            "debutant": "Débutant",
            "intermediaire": "Intermédiaire",
            "avance": "Avancé",
        }

        def format_timedelta(td):
            """Formatte timedelta en 'HH:MM:SS'"""
            if not td:
                return "00:00:00"
            total_seconds = int(td.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

        for course in courses:
            # Récupération de la progression
            progress_obj = ProgressionCours.objects.filter(
                utilisateur=user,
                cours=course
            ).first()
            progress = progress_obj.avancement_cours if progress_obj else 0.0
            # 🔹 Ajouter l'événement "course_followed" si l'utilisateur a commencé le cours
            if progress > 0:
              log_activity(user, "course_followed")

            temps_passe = progress_obj.temps_passe if progress_obj else timedelta(seconds=0)

            # Niveau lisible
            niveau_raw = getattr(course, 'niveau_cour', None)
            niveau_label = NIVEAUX_MAP.get(str(niveau_raw).lower(), "Débutant") if niveau_raw else "Débutant"

            # Détermination de l'action
            if progress == 0:
                action = "start"
            elif progress >= 100:
                action = "restart"
            else:
                action = "continue"

            data.append({
                "id_cours": course.id_cours,
                "titre_cour": course.titre_cour,
                "description": course.description,
                "niveau_cour_label": niveau_label,
                "utilisateur": course.utilisateur.id_utilisateur,
                "utilisateur_name": course.utilisateur.nom,
                "visibilite_cour": course.visibilite_cour,
                "duration_readable": (
                    course.get_duration_display()
                    if hasattr(course, 'get_duration_display')
                    else ""
                ),
                "progress": progress,
                "last_lesson_id": (
                    progress_obj.derniere_lecon.id_lecon
                    if progress_obj and progress_obj.derniere_lecon
                    else None
                ),
                "action": action,
                "temps_passe": int(temps_passe.total_seconds()),  # en secondes pour calculs JS
                "temps_passe_readable": format_timedelta(temps_passe)  # lisible HH:MM:SS
            })

        return Response(data)

@api_view(['POST'])
def assign_course_author(request, pk):
    try:
        cours = Cours.objects.get(pk=pk)
        user_id = request.data.get("user_id")
        user = Utilisateur.objects.get(pk=user_id)
        cours.utilisateur = user
        cours.save()
        return Response({"message": "Auteur assigné"}, status=200)
    except Cours.DoesNotExist:
        return Response({"error": "Cours introuvable"}, status=404)
class MarkLessonVisitedView(APIView):
    @jwt_required
    def post(self, request, lesson_id):
        try:
            lecon = Lecon.objects.get(pk=lesson_id)
        except Lecon.DoesNotExist:
            return Response({"error": "Leçon introuvable"}, status=404)

        LeconComplete.objects.get_or_create(utilisateur_id=request.user_id, lecon=lecon)
        return Response({"message": "Leçon marquée visitée"}, status=200)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_course_status(request, pk):
    course = get_object_or_404(Cours, pk=pk)

    status = request.data.get("status")
    if status not in ["pending", "approved", "rejected"]:
        return Response(
            {"error": "Statut invalide"},
            status=400
        )

    course.status = status
    course.save()

    return Response(
        {"message": "Statut mis à jour", "status": course.status}
    )
    
    
#Recherche par titre de cours
class CoursSearchView(APIView):

    def get(self, request):
        search = request.GET.get("search", "")

        cours = Cours.objects.all()
        if search:
            cours = cours.filter(
                Q(titre_cour__icontains=search) |
                Q(sections__titre_section__icontains=search)
            ).distinct()

        serializer = CoursSerializer(cours, many=True)
        return Response(serializer.data)

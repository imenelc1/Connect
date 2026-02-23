from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string
from django.db.models import Avg, Sum
from datetime import datetime, timedelta
import jwt
import uuid

# Imports des modèles
from .models import Utilisateur, Etudiant, Enseignant, Administrateur, PasswordResetToken
from courses.models import Cours
from exercices.models import Exercice
from quiz.models import Quiz, ReponseQuiz
from spaces.models import Space
from dashboard.models import ProgressionCours, ActivityEvent

# Imports des Serializers
from .serializers import (
    UtilisateurSerializer, EtudiantSerializer, EnseignantSerializer, 
    AdministrateurSerializer, ProfileSerializer, AdminProfileSerializer
)
from .jwt_helpers import IsAuthenticatedJWT

# -----------------------------
# Configuration JWT
# -----------------------------
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 24

def _create_token(user_id, role):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXP_HOURS)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token if isinstance(token, str) else token.decode("utf-8")

# -----------------------------
# AUTHENTICATION & REGISTRATION
# -----------------------------

class RegisterView(generics.CreateAPIView):
    serializer_class = UtilisateurSerializer

    def create(self, request, *args, **kwargs):
        role = request.data.get("role")
        user_serializer = self.get_serializer(data=request.data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        if role == "etudiant":
            Etudiant.objects.create(
                utilisateur=user,
                specialite=request.data.get("specialite"),
                annee_etude=request.data.get("annee_etude")
            )
        elif role == "enseignant":
            Enseignant.objects.create(
                utilisateur=user,
                grade=request.data.get("grade"),
                can_create_any_course_content=False
            )

        try:
            ActivityEvent.objects.create(user=user, event_type="registration")
        except:
            pass 

        token = _create_token(user.id_utilisateur, role)
        return Response({
            "message": "Utilisateur créé avec succès",
            "user": user_serializer.data,
            "role": role,
            "token": token
        }, status=201)

class LoginView(APIView):
    def post(self, request):
        email = (request.data.get("email") or request.data.get("adresse_email") or "").strip()
        password = (request.data.get("password") or request.data.get("mot_de_passe") or "").strip()
        role = (request.data.get("role") or "").strip().lower()

        if not email or not password:
            return Response({"error": "Email et mot de passe requis."}, status=400)

        try:
            user = Utilisateur.objects.get(adresse_email=email)
            if not user.check_password(password):
                return Response({"error": "Mot de passe incorrect."}, status=401)

            token = _create_token(user.id_utilisateur, role)
            
            try:
                ActivityEvent.objects.create(user=user, event_type="login")
            except:
                pass

            return Response({
                "message": "Connexion réussie",
                "token": token,
                "user": {
                    "user_id": user.id_utilisateur,
                    "nom": user.nom,
                    "prenom": user.prenom,
                    "email": user.adresse_email,
                    "role": role,
                    "must_change_password": user.must_change_password
                }
            }, status=200)
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur introuvable."}, status=404)

# -----------------------------
# PROFILE MANAGEMENT (NETTOYÉ)
# -----------------------------

class UserProfileView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def get(self, request):
        user = get_object_or_404(Utilisateur.objects.select_related("enseignant", "etudiant"), 
                                 id_utilisateur=request.user.id_utilisateur)
        serializer = AdminProfileSerializer(user) if hasattr(user, 'administrateur') else ProfileSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = get_object_or_404(Utilisateur, id_utilisateur=request.user.id_utilisateur)
        data = request.data
        user.nom = data.get("nom", user.nom)
        user.prenom = data.get("prenom", user.prenom)
        user.save()

        if hasattr(user, "etudiant"):
            user.etudiant.specialite = data.get("specialite", user.etudiant.specialite)
            user.etudiant.annee_etude = data.get("annee_etude", user.etudiant.annee_etude)
            user.etudiant.save()
        elif hasattr(user, "enseignant"):
            user.enseignant.grade = data.get("grade", user.enseignant.grade)
            user.enseignant.save()

        return Response({"message": "Profil mis à jour"})

# -----------------------------
# ADMIN & TEACHER ACTIONS
# -----------------------------

class IsAdminJWT(BasePermission):
    def has_permission(self, request, view):
        auth = request.headers.get("Authorization")
        if not auth: return False
        try:
            token = auth.split(" ")[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return payload.get("role") == "admin"
        except: return False

@api_view(["GET"])
@permission_classes([IsAdminJWT])
def admin_stats(request):
    return Response({
        "total_students": Etudiant.objects.count(),
        "total_courses": Cours.objects.count(),
        "total_exercises": Exercice.objects.count(),
        "total_spaces": Space.objects.count(),
    })

class AdminCreateEtudiantView(APIView):
    permission_classes = [IsAdminJWT]

    def post(self, request):
        data = request.data
        temp_password = get_random_string(length=10)
        try:
            user = Utilisateur.objects.create(
                nom=data["nom"], prenom=data["prenom"], adresse_email=data["email"],
                matricule=data.get("matricule"), must_change_password=True
            )
            user.set_password(temp_password)
            user.save()
            Etudiant.objects.create(utilisateur=user, specialite=data.get("specialite"), annee_etude=data.get("annee_etude"))
            return Response({"message": "Étudiant créé", "temp_pass": temp_password}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)




#--------------------
#Modifer password
#----------------------
class ResetPasswordView2(APIView):
    def post(self, request):
        token_str = request.data.get("token")
        new_password = request.data.get("new_password")

        if not token_str or not new_password:
            return Response({"error": "Token et nouveau mot de passe requis"}, status=400)

        try:
            payload = jwt.decode(token_str, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token expiré"}, status=400)
        except jwt.InvalidTokenError:
            return Response({"error": "Token invalide"}, status=400)

        try:
            user = Utilisateur.objects.get(id_utilisateur=user_id)
            user.set_password(new_password)
            user.must_change_password = False
            user.save()
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur introuvable."}, status=404)

        return Response({"message": "Mot de passe mis à jour avec succès"})
    
    
    
    
 
#--------------------
#MUtilisateur +cours lu + exo et quiz fait
#----------------------    

class ProgressionUtilisateurAPIView(APIView):
    """
    Progression complète d'un utilisateur :
    - infos utilisateur
    - cours lus
    - exercices faits
    - quiz faits (via ReponseQuiz)
    """

    def get(self, request, user_id):

        # 1️⃣ Utilisateur
        utilisateur = get_object_or_404(Utilisateur, id_utilisateur=user_id)
        etudiant=get_object_or_404(Etudiant, utilisateur=user_id)

        # 2️⃣ Cours lus
        cours_lus = (
            Cours.objects
            .filter(
                progressioncours__utilisateur=utilisateur,
                progressioncours__avancement_cours__gt=0
            )
            .distinct()
        )

        # 3️⃣ Exercices faits
        exercices_faits = (
            Exercice.objects
            .filter(
                tentativeexercice__utilisateur=utilisateur,
                tentativeexercice__etat__in=["soumis", "corrige"]
            )
            .distinct()
        )

        # 4️⃣ Quiz faits (via ReponseQuiz)
        quiz_faits_qs = (
            ReponseQuiz.objects
            .filter(
                etudiant=utilisateur,
                terminer=True
            )
            .select_related("quiz")
        )

        # Préparer la liste des quiz
        quiz_faits = [
            {
                "quiz_id": rq.quiz.id,
                "titre_quiz": rq.quiz.exercice.titre_exo,  # si tu veux titre de l'exo associé
                "score_minimum": rq.quiz.scoreMinimum,
                "score_obtenu": rq.score_total,
                "date_debut": rq.date_debut,
                "date_fin": rq.date_fin,
                "duration": rq.quiz.duration,
                "nbMax_tentative": rq.quiz.nbMax_tentative,
                "activerDuration": rq.quiz.activerDuration,
            }
            for rq in quiz_faits_qs
        ]

        # 5️⃣ Construction réponse finale
        data = {
            "utilisateur": {
                "id": utilisateur.id_utilisateur,
                "nom": utilisateur.nom,
                "prenom": utilisateur.prenom,
                "email": utilisateur.adresse_email,
                "points": utilisateur.points,
                "date_inscription": utilisateur.date_inscription,
                "matricule" : utilisateur.matricule,
                "adresse_email" : utilisateur.adresse_email,
                "date_naissance" : utilisateur.date_naissance,
                "specialite": etudiant.specialite,
                "annee_etude": etudiant.annee_etude,
                
            },

            "cours_lus": list(
                cours_lus.values(
                    "id_cours",
                    "titre_cour",
                    "niveau_cour",
                    "duration"
                )
            ),

            "exercices_faits": list(
                exercices_faits.values(
                    "id_exercice",
                    "titre_exo",
                    "niveau_exo",
                    "categorie"
                )
            ),

            "quiz_faits": quiz_faits  # ✅ injecte directement la liste
        }

        return Response(data, status=status.HTTP_200_OK)

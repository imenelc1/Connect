from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .models import Utilisateur, Etudiant, Enseignant, Administrateur, PasswordResetToken
from courses.models import Cours
from exercices.models import Exercice
from spaces.models import Space
from .serializers import UtilisateurSerializer, EtudiantSerializer, EnseignantSerializer, AdministrateurSerializer
import jwt
from django.conf import settings
from datetime import datetime, timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ProfileSerializer
from .jwt_helpers import IsAuthenticatedJWT
from django.core.mail import send_mail
import uuid
from rest_framework.permissions import BasePermission
from django.http import JsonResponse
from dashboard.models import ProgressionCours
from django.db.models import Avg
from quiz.models import ReponseQuiz
from django.db.models import Sum

# -----------------------------
# Constantes JWT manquantes
# -----------------------------
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 24

# -----------------------------
# Fonction de création du token
# -----------------------------
def _create_token(user_id, role):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXP_HOURS)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token
# -----------------------------
# RegisterView (presque inchangé)
# -----------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = UtilisateurSerializer

    def create(self, request, *args, **kwargs):
        role = request.data.get("role")
        user_serializer = self.get_serializer(data=request.data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        # Création profil
        if role == "etudiant":
            Etudiant.objects.create(
                utilisateur=user,
                specialite=request.data.get("specialite"),
                annee_etude=request.data.get("annee_etude")
            )
        elif role == "enseignant":
            Enseignant.objects.create(
                utilisateur=user,
                grade=request.data.get("grade")
            )

        # 🔥 CRÉATION DU TOKEN
        token = _create_token(user.id_utilisateur, role)

        # 🔥 Réponse complète
        return Response({
            "message": "Utilisateur créé avec succès",
            "user": user_serializer.data,
            "role": role,
            "token": token
        }, status=201)



# -----------------------------
# LoginView corrigé (ta logique respectée)
# -----------------------------
class LoginView(APIView):
    def post(self, request):
        email = (request.data.get("email") or request.data.get("adresse_email") or "").strip()
        password = (request.data.get("password") or request.data.get("mot_de_passe") or "").strip()
        role = (request.data.get("role") or "").strip().lower()

        if not email or not password:
            return Response({"error": "Email et mot de passe requis."}, status=400)

        if role not in ["etudiant", "enseignant"]:
            return Response({"error": "Rôle requis (etudiant ou enseignant)."}, status=400)

        try:
            user = Utilisateur.objects.get(adresse_email=email)

            if not user.check_password(password):
                return Response({"error": "Mot de passe incorrect."}, status=401)

            # --- Étudiant ---
            if role == "etudiant":
                if not hasattr(user, "etudiant"):
                    return Response({"error": "Accès réservé aux étudiants."}, status=403)
                token = _create_token(user.id_utilisateur, "etudiant")
                return Response({
                    "message": "Connexion réussie",
                    "token": token,
                    "user": {
                        "user_id": user.id_utilisateur,
                        "nom": user.nom,
                        "prenom": user.prenom,
                        "email": user.adresse_email,
                        "role": "etudiant",
                        "specialite": user.etudiant.specialite,
                        "annee_etude": user.etudiant.annee_etude
                    }
                }, status=200)

            # --- Enseignant ---
            elif role == "enseignant":
                if not hasattr(user, "enseignant"):
                    return Response({"error": "Accès réservé aux enseignants."}, status=403)
                token = _create_token(user.id_utilisateur, "enseignant")
                return Response({
                    "message": "Connexion réussie",
                    "token": token,
                    "user": {
                        "user_id": user.id_utilisateur,
                        "nom": user.nom,
                        "prenom": user.prenom,
                        "email": user.adresse_email,
                        "role": "enseignant",
                        "grade": user.enseignant.grade
                    }
                }, status=200)

        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur introuvable."}, status=404)
# -----------------------------
# Admin
# -----------------------------
class AdminRegisterView(generics.CreateAPIView):
    serializer_class = AdministrateurSerializer


class AdminLoginView(APIView):
    def post(self, request):
        email = request.data.get('email_admin')
        password = request.data.get('mdp_admin')

        try:
            admin = Administrateur.objects.get(email_admin=email)
            if admin.check_password(password):
                # 🔥 Création du token JWT pour admin
                payload = {
                    "admin_id": admin.id_admin,
                    "role": "admin",
                    "exp": datetime.utcnow() + timedelta(hours=24)
                }
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
                if isinstance(token, bytes):
                    token = token.decode("utf-8")

                return Response({
                    "message": "Connexion admin réussie",
                    "id_admin": admin.id_admin,
                    "email_admin": admin.email_admin,
                    "token": token
                }, status=status.HTTP_200_OK)

            return Response({"error": "Mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)

        except Administrateur.DoesNotExist:
            return Response({"error": "Admin introuvable"}, status=status.HTTP_404_NOT_FOUND)

class IsAdminJWT(BasePermission):
    def has_permission(self, request, view):
        auth = request.headers.get("Authorization")
        if not auth:
            return False

        try:
            token = auth.split(" ")[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return payload.get("role") == "admin"
        except:
            return False

# -----------------------------
# User Profile
# -----------------------------

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_object(self):
        # Garantit que request.user est bien un objet Utilisateur ou None
        if not hasattr(self.request, 'user') or self.request.user is None:
            return None
        return self.request.user

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        if not user:
            return Response({"error": "Utilisateur introuvable"}, status=404)
        serializer = self.get_serializer(user)
        return Response(serializer.data)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticatedJWT]  # JWT custom

    def put(self, request):
        user = request.user  # objet Utilisateur
        current_password = request.data.get("currentPassword")
        new_password = request.data.get("newPassword")
        confirm_password = request.data.get("confirmPassword")

        # Vérification mot de passe actuel
        if not user.check_password(current_password):
            return Response({"currentPassword": ["Mot de passe actuel incorrect"]}, status=400)

        # Vérification nouveau mot de passe (minimum 8 caractères)
        if len(new_password) < 8:
            return Response({"newPassword": ["Le mot de passe doit contenir au moins 8 caractères"]}, status=400)

        # Vérification correspondance
        if new_password != confirm_password:
            return Response({"confirmPassword": ["Les mots de passe ne correspondent pas"]}, status=400)

        # Mise à jour
        user.set_password(new_password)
        user.save()

        return Response({"detail": "Mot de passe mis à jour avec succès"}, status=200)

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email requis"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = Utilisateur.objects.get(adresse_email=email)
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        token = PasswordResetToken.objects.create(user=user)
        reset_link = f"http://localhost:5173/reset-password?token={token.token}"

        # envoyer email
        send_mail(
            "Réinitialisation de mot de passe",
            f"Cliquer sur ce lien pour réinitialiser votre mot de passe : {reset_link}",
            "no-reply@platform.com",
            [email],
            fail_silently=False,
        )

        return Response({"message": "Lien de réinitialisation envoyé"})
    
class ResetPasswordView(APIView):
    def post(self, request):
        token_str = request.data.get("token")
        new_password = request.data.get("new_password")

        if not token_str or not new_password:
            return Response({"error": "Token et nouveau mot de passe requis"}, status=400)

        try:
            token_obj = PasswordResetToken.objects.get(token=token_str)
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Token invalide"}, status=400)

        if not token_obj.is_valid():
            return Response({"error": "Token expiré"}, status=400)

        user = token_obj.user
        user.set_password(new_password)
        user.save()

        token_obj.delete()  # empêche réutilisation

        return Response({"message": "Mot de passe mis à jour avec succès"})
   
def send_reset_email(user_email, token):
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    send_mail(
        "Réinitialisation de mot de passe",
        f"Cliquer sur ce lien pour réinitialiser votre mot de passe : {reset_link}",
        "no-reply@platform.com",
        [user_email],
        fail_silently=False,
    )

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user_role == "admin"


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT, IsAdmin])
def admin_stats(request):
    from courses.models import Cours
    from exercices.models import Exercice
    from spaces.models import Space
    from .models import Etudiant

    try:
        data = {
            "total_students": Etudiant.objects.count(),
            "total_courses": Cours.objects.count(),
            "total_exercises": Exercice.objects.count(),
            "total_spaces": Space.objects.count(),
        }
        return Response(data, status=200)
    except Exception as e:
        return Response({"error": "Erreur serveur : " + str(e)}, status=500)

# Permission custom pour ton JWT
class IsAdminOrTeacherJWT(BasePermission):
    def has_permission(self, request, view):
        auth = request.headers.get("Authorization")
        if not auth:
            return False
        try:
            token = auth.split(" ")[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            # Tu peux filtrer par rôle si besoin
            return payload.get("role") in ["admin", "enseignant"]
        except:
            return False

@api_view(["GET"])
@permission_classes([IsAdminOrTeacherJWT])
def get_enseignants(request):
    enseignants = Enseignant.objects.select_related("utilisateur").all()
    data = [
        {
            "id_utilisateur": e.utilisateur.id_utilisateur,
            "nom": e.utilisateur.nom,
            "prenom": e.utilisateur.prenom,
            "email": e.utilisateur.adresse_email,
            "date_naissance": e.utilisateur.date_naissance,
            "grade": e.grade,
            "matricule": e.utilisateur.matricule
        }
        for e in enseignants
    ]
    return JsonResponse(data, safe=False)

@api_view(["GET"])
@permission_classes([IsAdminOrTeacherJWT])
def get_etudiants(request):
    etudiants = Etudiant.objects.select_related("utilisateur").all()

    data = []
    for e in etudiants:
        u = e.utilisateur
        data.append({
            "id": u.id_utilisateur,
            "nom": u.nom,
            "prenom": u.prenom,
            "email": u.adresse_email,
            "specialite": e.specialite,
            "annee_etude": e.annee_etude,
            "initials": f"{u.nom[0]}{u.prenom[0]}".upper(),
            "joined": u.date_inscription.strftime("%d/%m/%Y") if hasattr(u, "date_inscription") else "—",
            "courses": 0,      # 🔹 tu pourras le calculer plus tard
            "progress": 0      # 🔹 idem
        })

    return Response(data, status=200)

@api_view(["GET"])
@permission_classes([IsAdminOrTeacherJWT])
def students_with_progress(request):
    students = Etudiant.objects.select_related("utilisateur").all()
    data = []

    for etudiant in students:
        u = etudiant.utilisateur

        # Nombre de cours suivis
        cours_suivis = ProgressionCours.objects.filter(utilisateur=u)
        nb_cours = cours_suivis.count()

        # Progression globale moyenne
        avg_progress = cours_suivis.aggregate(global_progress=Avg("avancement_cours"))["global_progress"] or 0
        avg_progress = round(avg_progress)

        data.append({
            "id": u.id_utilisateur,
            "nom": u.nom,
            "prenom": u.prenom,
            "email": u.adresse_email,
            "initials": f"{u.nom[0]}{u.prenom[0]}".upper(),
            "courses_count": nb_cours,
            "progress": avg_progress,
            "joined": u.date_inscription.strftime("%d/%m/%Y") if u.date_inscription else "—",
            # 🔹 pas besoin des détails des quiz ici
        })

    return Response(data)

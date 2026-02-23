from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .models import Utilisateur, Etudiant, Enseignant, Administrateur, PasswordResetToken
from courses.models import Cours
from exercices.models import Exercice
from quiz.models import Quiz, ReponseQuiz
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
from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string
from dashboard.models import ActivityEvent

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
        grade=request.data.get("grade"),
        can_create_any_course_content=False
    )

        try:
            ActivityEvent.objects.create(user=user, event_type="registration")
        except Exception:
            pass
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

            # Génération token JWT
            token = _create_token(user.id_utilisateur, role)

            # Préparer données utilisateur
            user_data = {
                "user_id": user.id_utilisateur,
                "nom": user.nom,
                "prenom": user.prenom,
                "email": user.adresse_email,
                "role": role,
                "must_change_password": user.must_change_password,
            }

            if role == "etudiant":
                if not hasattr(user, "etudiant"):
                    return Response({"error": "Accès réservé aux étudiants."}, status=403)
                user_data.update({
                    "specialite": user.etudiant.specialite,
                    "annee_etude": user.etudiant.annee_etude
                })

            elif role == "enseignant":
                if not hasattr(user, "enseignant"):
                    return Response({"error": "Accès réservé aux enseignants."}, status=403)
                user_data.update({
                    "grade": user.enseignant.grade,
                    "can_create_any_course_content": user.enseignant.can_create_any_course_content
    
                })

            # Si l’utilisateur doit changer le mot de passe, renvoyer aussi un reset_token
            response_data = {
                "message": "Connexion réussie",
                "token": token,
                "user": user_data
            }
            try:
                ActivityEvent.objects.create(
                user=user,
                event_type="login"
                )
            except Exception:
                pass


            if user.must_change_password:
                reset_token = _create_token(user.id_utilisateur, role)
                response_data["reset_token"] = reset_token

            return Response(response_data, status=200)

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

from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

class UserProfileView(GenericAPIView):
    permission_classes = [IsAuthenticatedJWT]

    def get_object(self):
        user = self.request.user
        return Utilisateur.objects.select_related("enseignant", "etudiant").get(
            id_utilisateur=user.id_utilisateur
        )

    def get_serializer_class(self):
        user = self.get_object()
        if isinstance(user, Administrateur):
            return AdminProfileSerializer
        return ProfileSerializer

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data

        # Champs Utilisateur
        user.nom = data.get("nom", user.nom)
        user.prenom = data.get("prenom", user.prenom)
        user.adresse_email = data.get("adresse_email", user.adresse_email)
        user.date_naissance = data.get("date_naissance", user.date_naissance)
        user.matricule = data.get("matricule", user.matricule)
        user.save()

        # Champs Etudiant
        if hasattr(user, "etudiant") and user.etudiant:
            user.etudiant.specialite = data.get("specialite", user.etudiant.specialite)
            user.etudiant.annee_etude = data.get("annee_etude", user.etudiant.annee_etude)
            user.etudiant.save()

        # Champs Enseignant
        if hasattr(user, "enseignant") and user.enseignant:
            user.enseignant.grade = data.get("grade", user.enseignant.grade)
            user.enseignant.save()

        serializer = self.get_serializer(user)
        return Response(serializer.data, status=200)
    permission_classes = [IsAuthenticated]  # ou IsAuthenticatedJWT si tu veux ton custom JWT

    def get_object(self):
        user = self.request.user
        # Précharge les relations pour éviter obj.enseignant=None
        if isinstance(user, Utilisateur):
            return Utilisateur.objects.select_related("enseignant", "etudiant").get(
                id_utilisateur=user.id_utilisateur
            )
        return user  # pour admin

    def get_serializer_class(self):
        user = self.get_object()
        if isinstance(user, Administrateur):
            return AdminProfileSerializer
        return ProfileSerializer

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data

        # Champs Utilisateur
        user.nom = data.get("nom", user.nom)
        user.prenom = data.get("prenom", user.prenom)
        user.adresse_email = data.get("adresse_email", user.adresse_email)
        user.date_naissance = data.get("date_naissance", user.date_naissance)
        user.matricule = data.get("matricule", user.matricule)
        user.save()

        # Champs Etudiant
        if hasattr(user, "etudiant"):
            user.etudiant.specialite = data.get("specialite", user.etudiant.specialite)
            user.etudiant.annee_etude = data.get("annee_etude", user.etudiant.annee_etude)
            user.etudiant.save()

        # Champs Enseignant
        if hasattr(user, "enseignant"):
            user.enseignant.grade = data.get("grade", user.enseignant.grade)
            user.enseignant.save()

        serializer = self.get_serializer(user)
        return Response(serializer.data)
    permission_classes = [IsAuthenticatedJWT]

    def get_serializer_class(self):
        user = self.request.user

        if isinstance(user, Administrateur):
            return AdminProfileSerializer
        
        return ProfileSerializer

    def get(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data

        # Champs Utilisateur
        user.nom = data.get("nom", user.nom)
        user.prenom = data.get("prenom", user.prenom)
        user.adresse_email = data.get("adresse_email", user.adresse_email)
        user.date_naissance = data.get("date_naissance", user.date_naissance)
        user.matricule = data.get("matricule", user.matricule)
        user.save()

        # Champs Etudiant
        if hasattr(user, "etudiant"):
            user.etudiant.specialite = data.get("specialite", user.etudiant.specialite)
            user.etudiant.annee_etude = data.get("annee_etude", user.etudiant.annee_etude)
            user.etudiant.save()

        # Champs Enseignant
        if hasattr(user, "enseignant"):
            user.enseignant.grade = data.get("grade", user.enseignant.grade)
            user.enseignant.save()

        serializer = self.get_serializer(user)
        return Response(serializer.data, status=200)

    permission_classes = [IsAuthenticatedJWT]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        user = self.get_object()

        # 👇 Si c'est un administrateur → serializer admin
        if isinstance(user, Administrateur):
            return AdminProfileSerializer
        
        # 👇 Sinon → serializer utilisateur normal
        return ProfileSerializer

    def get(self, request, *args, **kwargs):
        user = self.get_object()
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
        user.must_change_password = False
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
            "matricule": u.matricule or "—", #Affiicher marticule
            "specialite": etudiant.specialite or "—", #Ajouter afficher la specialie
            "annee_etude": etudiant.annee_etude or "—", #annee d'etude
        })

    return Response(data)



#=============ADDED BY CHAHLA======================
class AdminDeleteUserView(APIView):
    permission_classes = [IsAdminJWT]

    def delete(self, request, user_id):
        utilisateur = get_object_or_404(Utilisateur, id_utilisateur=user_id)

        # 🔒 Empêcher suppression d’un admin
        if hasattr(utilisateur, "administrateur"):
            return Response(
                {"error": "Impossible de supprimer un administrateur"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # ---------- CAS ÉTUDIANT ----------
            """ if hasattr(utilisateur, "etudiant"):
                # Supprimer toutes les données liées
                #ProgressionCours.objects.filter(utilisateur=utilisateur).delete()
                #ReponseQuiz.objects.filter(utilisateur=utilisateur).delete()
                # Etudiant supprimé automatiquement avec CASCADE si FK sur Utilisateur
                # utilisateur.etudiant.delete()  # pas nécessaire si CASCADE

            # ---------- CAS ENSEIGNANT ----------
            elif hasattr(utilisateur, "enseignant"):
                #enseignant = utilisateur.enseignant

                # Supprimer tous les espaces liés à l'enseignant
                #Space.objects.filter(utilisateur=utilisateur).delete()

                # Supprimer tous les cours créés par l'enseignant
                #Cours.objects.filter(utilisateur=utilisateur).delete()

                # Supprimer tous les exercices créés par l'enseignant
                #Exercice.objects.filter(utilisateur=utilisateur).delete()

                # Supprimer toutes les réponses aux quiz de cet enseignant
                #ReponseQuiz.objects.filter(utilisateur=utilisateur).delete()

                # L'enseignant sera supprimé automatiquement avec CASCADE sur Utilisateur
                # enseignant.delete()  # pas nécessaire si CASCADE

            # ---------- SUPPRIMER L'UTILISATEUR ----------"""
            utilisateur.delete()  # CASCADE supprimera Etudiant ou Enseignant

            return Response(
                {"message": "Utilisateur et toutes ses données associées supprimés avec succès"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Erreur lors de la suppression : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
            
            
            

# -----------------------------
# Permission custom : admin ou owner
# -----------------------------
class IsAdminOrSelf(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Récupérer le payload JWT
        auth = request.headers.get("Authorization")
        if not auth:
            return False
        try:
            token = auth.split(" ")[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            role = payload.get("role")
            user_id = payload.get("user_id")
            # Admin peut tout faire
            if role == "admin":
                return True
            # L'utilisateur peut modifier ses propres données
            return obj.id_utilisateur == user_id
        except:
            return False

# -----------------------------
# View pour modifier un enseignant
# -----------------------------
@api_view(["PUT"])
@permission_classes([IsAdminOrSelf])
def update_enseignant(request, user_id):
    utilisateur = get_object_or_404(Utilisateur, id_utilisateur=user_id)

    # Vérifier que c'est bien un enseignant
    if not hasattr(utilisateur, "enseignant"):
        return Response({"error": "Utilisateur n'est pas un enseignant"}, status=400)

    # Permissions : admin ou lui-même
    permission = IsAdminOrSelf()
    if not permission.has_object_permission(request, None, utilisateur):
        return Response({"error": "Accès refusé"}, status=403)

    data = request.data

    # Mise à jour des champs de Utilisateur
    utilisateur.nom = data.get("nom", utilisateur.nom)
    utilisateur.prenom = data.get("prenom", utilisateur.prenom)
    utilisateur.adresse_email = data.get("email", utilisateur.adresse_email)
    utilisateur.date_naissance = data.get("date_naissance", utilisateur.date_naissance)
    utilisateur.matricule = data.get("matricule", utilisateur.matricule)
    utilisateur.save()

    # Mise à jour des champs spécifiques Enseignant
    enseignant = utilisateur.enseignant
    enseignant.grade = data.get("grade", enseignant.grade)
    enseignant.save()
    notify_user_update(utilisateur)

    # Serializer pour retourner les infos
    serializer = EnseignantSerializer(enseignant)
    return Response(serializer.data, status=200)

# -----------------------------
# View pour modifier un etudiant
# -----------------------------
@api_view(["PUT"])
@permission_classes([IsAdminOrSelf])
def update_etudiant(request, user_id):
    utilisateur = get_object_or_404(Utilisateur, id_utilisateur=user_id)

    # Vérifier que c'est bien un étudiant
    if not hasattr(utilisateur, "etudiant"):
        return Response({"error": "Utilisateur n'est pas un étudiant"}, status=400)

    # Vérifier permission
    permission = IsAdminOrSelf()
    if not permission.has_object_permission(request, None, utilisateur):
        return Response({"error": "Accès refusé"}, status=403)

    data = request.data

    # Mise à jour des champs Utilisateur
    utilisateur.nom = data.get("nom", utilisateur.nom)
    utilisateur.prenom = data.get("prenom", utilisateur.prenom)
    utilisateur.adresse_email = data.get("email", utilisateur.adresse_email)
    utilisateur.date_naissance = data.get("date_naissance", utilisateur.date_naissance)
    utilisateur.matricule = data.get("matricule", utilisateur.matricule)
    utilisateur.save()

    # Mise à jour des champs Etudiant
    etudiant = utilisateur.etudiant
    etudiant.specialite = data.get("specialite", etudiant.specialite)
    etudiant.annee_etude = data.get("annee_etude", etudiant.annee_etude)
    etudiant.save()

    # Envoyer email de notification
    notify_user_update(utilisateur)

    # Retourner les infos mises à jour
    serializer = EtudiantSerializer(etudiant)
    return Response(serializer.data, status=200)

# -----------------------------
# View pour Informer L'utilisateur (enseignant, etudiant) que ses info sont modifié
# -----------------------------
def notify_user_update(user):
    """
    Envoie un email à l'utilisateur (enseignant ou étudiant)
    après modification de ses informations personnelles.
    """
    subject = "Vos informations ont été mises à jour"

    # Détecter le type d'utilisateur et récupérer les champs spécifiques
    if hasattr(user, "enseignant"):
        role_specific = f"Grade : {user.enseignant.grade}"
    elif hasattr(user, "etudiant"):
        role_specific = f"Spécialité : {user.etudiant.specialite}\nAnnée d'étude : {user.etudiant.annee_etude}"
    else:
        role_specific = "—"

    message = f"""
Bonjour {user.prenom},

Un administrateur a modifié vos informations personnelles sur notre plateforme.
Voici vos nouvelles informations :

Nom : {user.nom}
Prénom : {user.prenom}
Email : {user.adresse_email}
Matricule : {user.matricule}
{role_specific}

Si vous n'êtes pas à l'origine de ces modifications, merci de contacter le support immédiatement.
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.adresse_email],
        fail_silently=False,
    )



#---------------------------------------
#View pour l'admin crée un enseignant , et lui envoyer un email pour reset his password
#------------------------------------------
class AdminCreateEnseignantView(APIView):
    permission_classes = [IsAdminJWT]

    def post(self, request):
        data = request.data

        required_fields = ["nom", "prenom", "email", "matricule", "grade"]
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {"error": f"{field} est requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Vérifier email unique
        if Utilisateur.objects.filter(adresse_email=data["email"]).exists():
            return Response(
                {"error": "Un utilisateur avec cet email existe déjà"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔐 Mot de passe temporaire
        temp_password = get_random_string(length=10)
        date_naissance = data.get("date_naissance")  # récupère la valeur si fournie
        # Création utilisateur
        utilisateur = Utilisateur.objects.create(
            nom=data["nom"],
            prenom=data["prenom"],
            adresse_email=data["email"],
            matricule=data["matricule"],
            date_naissance=date_naissance, 
            must_change_password=True,
        )
        utilisateur.set_password(temp_password)
        utilisateur.save()

        # Création enseignant
        Enseignant.objects.create(
            utilisateur=utilisateur,
            grade=data["grade"]
        )

        # 📧 Envoi email
        self.send_welcome_email(utilisateur, temp_password)

        return Response(
            {
                "message": "Enseignant créé avec succès et email envoyé",
                "id_utilisateur": utilisateur.id_utilisateur
            },
            status=status.HTTP_201_CREATED
        )

    def send_welcome_email(self, user, temp_password):
        subject = "Votre compte enseignant a été créé"
        message = f"""
Bonjour {user.prenom},

Un compte enseignant vient d’être créé pour vous sur notre plateforme.

Vos informations :
Email : {user.adresse_email}
Mot de passe temporaire : {temp_password}

⚠️ Pour des raisons de sécurité, merci de modifier votre mot de passe dès votre première connexion.



Si vous n’êtes pas à l’origine de cette création, contactez immédiatement le support.

Cordialement,
L’équipe pédagogique
"""

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.adresse_email],
            fail_silently=False,
        )
        
        
        
#----------------------
#Ajouter un etudiant by l'admin
#---------------------

class AdminCreateEtudiantView(APIView):
    permission_classes = [IsAdminJWT]

    def post(self, request):
        data = request.data

        # Champs requis
        required_fields = ["nom", "prenom", "email", "matricule",  "date_naissance", "specialite", "annee_etude" ]
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {"error": f"{field} est requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Vérifier email unique
        if Utilisateur.objects.filter(adresse_email=data["email"]).exists():
            return Response(
                {"error": "Un utilisateur avec cet email existe déjà"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔐 Mot de passe temporaire
        temp_password = get_random_string(length=10)

        # Création utilisateur
        utilisateur = Utilisateur.objects.create(
            nom=data["nom"],
            prenom=data["prenom"],
            adresse_email=data["email"],
            matricule=data["matricule"],
            date_naissance=data["date_naissance"],
            must_change_password=True,  # forcer changement à la première connexion
        )
        utilisateur.set_password(temp_password)
        utilisateur.save()

        # Création étudiant
        Etudiant.objects.create(
            utilisateur=utilisateur,
            specialite=data["specialite"],
            annee_etude=data["annee_etude"]
        )

        # 📧 Envoi email
        self.send_welcome_email(utilisateur, temp_password)

        return Response(
            {
                "message": "Étudiant créé avec succès et email envoyé",
                "id_utilisateur": utilisateur.id_utilisateur
            },
            status=status.HTTP_201_CREATED
        )

    def send_welcome_email(self, user, temp_password):
        subject = "Votre compte étudiant a été créé"
        message = f"""
Bonjour {user.prenom},

Un compte étudiant vient d’être créé pour vous sur notre plateforme.

Vos informations :
Email : {user.adresse_email}
Mot de passe temporaire : {temp_password}
Date de naissance : {user.date_naissance}

⚠️ Pour des raisons de sécurité, merci de modifier votre mot de passe dès votre première connexion.

Lien pour changer votre mot de passe : https://monsite.com/change-password

Si vous n’êtes pas à l’origine de cette création, contactez immédiatement le support.

Cordialement,
L’équipe pédagogique
"""

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.adresse_email],
            fail_silently=False,
        )


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

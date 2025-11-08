from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from .models import Utilisateur, Etudiant, Enseignant, Administrateur
from .serializers import UtilisateurSerializer, EtudiantSerializer, EnseignantSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = UtilisateurSerializer

    def create(self, request, *args, **kwargs):
        role = request.data.get("role")  # 'etudiant' ou 'enseignant'
        user_serializer = self.get_serializer(data=request.data) #
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save(mot_de_passe=make_password(request.data["mot_de_passe"]))

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

        data = user_serializer.data
        data.pop("mot_de_passe", None)
        data["role"] = role
        return Response({
            "message": "Utilisateur créé avec succès",
            "user": data
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('adresse_email')
        password = request.data.get('mot_de_passe')

        try:
            user = Utilisateur.objects.get(adresse_email=email) #On cherche l’utilisateur dans la base de données grâce à l’email fourni.
            if check_password(password, user.mot_de_passe):
                role = None
                role_data = {}
                try:
                    etu = user.etudiant
                    role = "etudiant"
                    role_data = {"specialite": etu.specialite, "annee_etude": etu.annee_etude}
                except Etudiant.DoesNotExist:
                    try:
                        ens = user.enseignant
                        role = "enseignant"
                        role_data = {"grade": ens.grade}
                    except Enseignant.DoesNotExist:
                        pass

                return Response({
                    "message": "Connexion réussie",
                    "user_id": user.id_utilisateur,
                    "nom": user.nom,
                    "prenom": user.prenom,
                    "role": role,
                    **role_data
                }, status=status.HTTP_200_OK)
            return Response({"error": "Mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)
        
class AdminLoginView(APIView):
    def post(self, request):
        email = request.data.get('email_admin')
        password = request.data.get('mdp_admin')

        try:
            admin = Administrateur.objects.get(email_admin=email)
            if check_password(password, admin.mdp_admin):
                return Response({
                    "message": "Connexion admin réussie",
                    "id_admin": admin.id_admin,
                    "email_admin": admin.email_admin
                }, status=status.HTTP_200_OK)
            return Response({"error": "Mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)
        except Administrateur.DoesNotExist:
            return Response({"error": "Admin introuvable"}, status=status.HTTP_404_NOT_FOUND)

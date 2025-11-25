from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Utilisateur, Etudiant, Enseignant, Administrateur
from .serializers import UtilisateurSerializer, EtudiantSerializer, EnseignantSerializer, AdministrateurSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = UtilisateurSerializer

    def create(self, request, *args, **kwargs):
        role = request.data.get("role")
        user_serializer = self.get_serializer(data=request.data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        # Création du profil selon le rôle
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

        # Réponse
        data = user_serializer.data
        data["role"] = role
        return Response({
            "message": "Utilisateur créé avec succès",
            "user": data
        }, status=status.HTTP_201_CREATED)



class LoginView(APIView):
    def post(self, request):
        email = request.data.get("adresse_email") or request.data.get("email")
        password = request.data.get("mot_de_passe") or request.data.get("password")

        if not email or not password:
            return Response({"error": "Email et mot de passe requis"}, status=400)

        try:
            user = Utilisateur.objects.get(adresse_email=email)

            if user.check_password(password):
                role = None
                role_data = {}

                if hasattr(user, "etudiant"):
                    role = "etudiant"
                    role_data = {
                        "specialite": user.etudiant.specialite,
                        "annee_etude": user.etudiant.annee_etude,
                    }

                elif hasattr(user, "enseignant"):
                    role = "enseignant"
                    role_data = {
                        "grade": user.enseignant.grade,
                    }

                return Response({
                    "message": "Connexion réussie",
                    "user_id": user.id_utilisateur,
                    "nom": user.nom,
                    "prenom": user.prenom,
                    "email": user.adresse_email,
                    "role": role,
                    **role_data
                }, status=200)

            return Response({"error": "Mot de passe incorrect"}, status=401)

        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=404)


class AdminRegisterView(generics.CreateAPIView):
    serializer_class = AdministrateurSerializer


class AdminLoginView(APIView):
    def post(self, request):
        email = request.data.get('email_admin')
        password = request.data.get('mdp_admin')

        try:
            admin = Administrateur.objects.get(email_admin=email)
            if admin.check_password(password):
                return Response({
                    "message": "Connexion admin réussie",
                    "id_admin": admin.id_admin,
                    "email_admin": admin.email_admin
                }, status=status.HTTP_200_OK)
            return Response({"error": "Mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)
        except Administrateur.DoesNotExist:
            return Response({"error": "Admin introuvable"}, status=status.HTTP_404_NOT_FOUND)


class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        data = UtilisateurSerializer(user).data

        # Ajouter rôle et infos spécifiques
        role = None
        try:
            etu = user.etudiant
            role = "etudiant"
            data["specialite"] = etu.specialite
            data["annee_etude"] = etu.annee_etude
        except Etudiant.DoesNotExist:
            try:
                ens = user.enseignant
                role = "enseignant"
                data["grade"] = ens.grade
            except Enseignant.DoesNotExist:
                pass

        data["role"] = role
        return Response(data)

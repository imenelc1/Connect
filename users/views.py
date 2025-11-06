from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from .models import Utilisateur
from .serializers import UtilisateurSerializer

class RegisterView(generics.CreateAPIView):
    queryset = Utilisateur.objects.all() #Sur quel modèle elle agit (Utilisateur)
    serializer_class = UtilisateurSerializer #Quel sérialiseur elle utilise

    def perform_create(self, serializer):
        password = serializer.validated_data['mot_de_passe']# Récupère le mot de passe en clair
        serializer.save(mot_de_passe=make_password(password)) # Hache le mot de passe avant de sauvegarder

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs) #Appelle la méthode create parente pour gérer la création
        user_data = response.data #Données de l’utilisateur créé
        user_data.pop('mot_de_passe', None)  # Supprime le mot de passe des données renvoyées
        return Response({
            "message": "Utilisateur créé avec succès",
            "user": user_data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('adresse_email')
        password = request.data.get('mot_de_passe')

        try:
            user = Utilisateur.objects.get(adresse_email=email) 
            if check_password(password, user.mot_de_passe): #check_password refait le hachage du mot de passe entré et compare les deux versions.
                return Response({
                    "message": "Connexion réussie",
                    "user_id": user.id_utilisateur,
                    "nom": user.nom,
                    "prenom": user.prenom
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

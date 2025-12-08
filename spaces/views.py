from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status

from users.models import Utilisateur
from .models import Space, SpaceEtudiant
from .serializers import (
    SpaceSerializer,
    SpaceEtudiantCreateSerializer,
    SpaceEtudiantDisplaySerializer
)
from users.jwt_auth import IsAuthenticatedJWT, jwt_required

# --- Création d'un espace ---
class CreateSpaceView(APIView):
    @jwt_required
    def post(self, request):
        data = request.data.copy()
        user = request.user

        serializer = SpaceSerializer(data=data)
        if serializer.is_valid():
            space = serializer.save(utilisateur=user)
            return Response(SpaceSerializer(space).data, status=201)
        return Response(serializer.errors, status=400)

# --- Liste des espaces du prof connecté ---
# --- Liste des espaces du prof connecté ---
class SpaceListView(generics.ListAPIView):
    serializer_class = SpaceSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        user = self.request.user
        return Space.objects.filter(utilisateur=user)

# --- Détail / Update / Delete d'un espace ---
class SpaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SpaceSerializer
    permission_classes = [IsAuthenticatedJWT]
    lookup_field = 'id_space'

    def get_queryset(self):
        user = self.request.user
        return Space.objects.filter(utilisateur=user)

# --- Ajouter un étudiant à un espace ---
class AddStudentToSpaceView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    @jwt_required
    def post(self, request):
        data = request.data
        email = data.get("email")
        space_id = data.get("space_id")

        if not email or not space_id:
            return Response({"error": "Email et space_id requis"}, status=status.HTTP_400_BAD_REQUEST)

        # Chercher l'étudiant
        try:
            user = Utilisateur.objects.get(adresse_email=email)
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        # Chercher l'espace uniquement parmi ceux du prof connecté
        try:
            space = Space.objects.get(id_space=space_id, utilisateur=request.user)
        except Space.DoesNotExist:
            return Response({"error": "Espace non trouvé ou non autorisé"}, status=status.HTTP_404_NOT_FOUND)

        # Créer la relation étudiant-espace
        serializer = SpaceEtudiantCreateSerializer(data={"etudiant": user.id_utilisateur, "space": space.id_space})
        if serializer.is_valid():
            space_etudiant = serializer.save()
            display_serializer = SpaceEtudiantDisplaySerializer(space_etudiant)
            return Response(display_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# --- Liste des étudiants par espaces du prof connecté ---
# --- Lister tous les étudiants des espaces du prof ---
class SpaceEtudiantListView(generics.ListAPIView):
    serializer_class = SpaceEtudiantDisplaySerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        user = self.request.user
        # Récupérer tous les étudiants des espaces de ce prof
        return SpaceEtudiant.objects.select_related('etudiant', 'space').filter(space__utilisateur=user)
    

class MySpacesStudentView(generics.ListAPIView):
    serializer_class = SpaceSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        user = self.request.user
        return Space.objects.filter(spaceetudiant__etudiant=user)


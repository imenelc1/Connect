from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from users.models import Utilisateur
from .models import Space, SpaceEtudiant
from .serializers import SpaceEtudiantSerializer, SpaceSerializer
from users.jwt_auth import jwt_required
from rest_framework.decorators import api_view

# --- Création d'un espace ---
class CreateSpaceView(APIView):

    @jwt_required
    def post(self, request):
        # Copier les données du front
        data = request.data.copy()

        # Récupérer l'utilisateur connecté 
        user = request.user  

        serializer = SpaceSerializer(data=data)
        if serializer.is_valid():
            # Assigne l'utilisateur connecté correctement
            space = serializer.save(utilisateur=user)
            return Response(SpaceSerializer(space).data, status=201)
        return Response(serializer.errors, status=400)


# --- Liste de tous les espaces ---
class SpaceListView(generics.ListAPIView):
    queryset = Space.objects.all()
    serializer_class = SpaceSerializer
    permission_classes = []  # On peut ajouter JWT si nécessaire

# --- Détail / Update / Delete ---
class SpaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Space.objects.all()
    serializer_class = SpaceSerializer

    @jwt_required
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @jwt_required
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)
class AddStudentToSpaceView(APIView):

    @jwt_required
    def post(self, request):
        data = request.data.copy()

        # Chercher l'étudiant par email
        email = data.get("email")
        space_id = data.get("space_id")
        if not email or not space_id:
            return Response({"error": "Email et space_id requis"}, status=400)

        try:
            user = Utilisateur.objects.get(adresse_email=email)
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé"}, status=404)

        # Préparer les données pour le serializer
        serializer_data = {
            "etudiant": user.id_utilisateur,
            "space": space_id
        }

        serializer = SpaceEtudiantSerializer(data=serializer_data)
        if serializer.is_valid():
            space_etudiant = serializer.save()
            return Response(SpaceEtudiantSerializer(space_etudiant).data, status=201)
        return Response(serializer.errors, status=400)

# --- Lister tous les étudiants par espace ---
# views.py
# --- Liste de tous les étudiants par espace de l'utilisateur connecté ---
class SpaceEtudiantListView(generics.ListAPIView):
    serializer_class = SpaceEtudiantSerializer
    permission_classes = []  # tu peux ajouter JWT permission si besoin

    def get_queryset(self):
        user = self.request.user  # récupère correctement l'utilisateur connecté
        if user.is_anonymous:
            return SpaceEtudiant.objects.none()
        # récupérer tous les espaces de l'utilisateur
        spaces = Space.objects.filter(utilisateur=user)
        return SpaceEtudiant.objects.filter(space__in=spaces).select_related('etudiant', 'space')
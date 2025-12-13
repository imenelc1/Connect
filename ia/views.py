from django.shortcuts import render
from rest_framework import viewsets
from dashboard.services.badges_services import attribuer_badges
from ia.models import Analyse
from ia.serializers import AnalyseSerializer

# --- Analyse IA ---
class AnalyseViewSet(viewsets.ModelViewSet):
    queryset = Analyse.objects.all()
    serializer_class = AnalyseSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        utilisateur_id = request.data.get('utilisateur')
        from users.models import Utilisateur
        utilisateur = Utilisateur.objects.get(pk=utilisateur_id)
        attribuer_badges(utilisateur)
        return response

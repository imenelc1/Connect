from django.shortcuts import render
from badges.models import Badge
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, F, Q
from .models import ProgressionCours, Badge, TentativeExercice, Analyse, GagnerBadge
from courses.models import Quiz, Exercice,Question
from .serializers import ProgressionCoursSerializer, BadgeSerializer, TentativeExerciceSerializer, AnalyseSerializer, GagnerBadgeSerializer
from courses.serializers import QuizSerializer, ExerciceSerializer
from django.utils import timezone
from datetime import timedelta
from users.models import Utilisateur


# --- Badge ---
class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer

    @action(detail=False, methods=['get'])
    def my_badges(self, request):
        utilisateur = request.user
        badges = GagnerBadge.objects.filter(utilisateur=utilisateur)
        serializer = GagnerBadgeSerializer(badges, many=True)
        return Response(serializer.data)

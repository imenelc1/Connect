from datetime import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from courses.models import Cours, Lecon
from users.jwt_auth import IsAuthenticatedJWT
from .models import LeconComplete, ProgressionCours


@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def complete_lesson(request, lecon_id):
    user = request.user
    try:
        lecon = Lecon.objects.get(pk=lecon_id)
    except Lecon.DoesNotExist:
        return Response({"error": "Lesson not found"}, status=404)

    # Marquer la leçon comme complète
    lc, created = LeconComplete.objects.get_or_create(utilisateur=user, lecon=lecon)

    # Calculer la progression
    cours = lecon.section.cours
    total_lecons = Lecon.objects.filter(section__cours=cours).count()
    completed_lecons = LeconComplete.objects.filter(utilisateur=user, lecon__section__cours=cours).count()
    avancement = (completed_lecons / total_lecons) * 100
    avancement = round(avancement)


    # Mettre à jour ProgressionCours
    pc, created = ProgressionCours.objects.get_or_create(
    utilisateur=user,
    cours=cours,
    defaults={
        "avancement_cours": 0.0,
        "temps_passe": timedelta(seconds=0)
    }
)
    pc.avancement_cours = avancement
    pc.temps_passe = pc.temps_passe 
    pc.save()

    return Response({"progress": avancement})
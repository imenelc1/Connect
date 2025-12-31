from django.utils.timezone import localtime, now
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from dashboard import models
from dashboard.models import SessionDuration, TentativeExercice
from users.jwt_auth import IsAuthenticatedJWT  
from rest_framework.response import Response
from .models import Badge, GagnerBadge
from django.db import models

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def user_badges(request):
    user = request.user
    gained_ids = GagnerBadge.objects.filter(utilisateur=user).values_list('badge_id', flat=True)
    badges = Badge.objects.all()
    data = []

    for badge in badges:
        data.append({
            "id": badge.id,
            "title": badge.nom,
            "desc": badge.description,
            "category": badge.categorie,
            "xp": f"+{badge.numpoints} XP",
            "locked": badge.id not in gained_ids,
            "icon": badge.icone.url if badge.icone else None
        })

    return Response(data)

def check_course_badges(user, progression):
    from dashboard.models import ProgressionCours

    # Récupérer le nombre de cours terminés à 100%
    completed_courses_count = ProgressionCours.objects.filter(
        utilisateur=user,
        avancement_cours=100
    ).count()

    # Badge Course Explorer : 1 cours terminé
    if completed_courses_count >= 1:
        badge = Badge.objects.get(nom="Course Explorer")
        GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)

    # Badge Halfway There : 50% de progression sur au moins 1 cours
    halfway_course = ProgressionCours.objects.filter(
        utilisateur=user,
        avancement_cours__gte=50
    ).exists()
    if halfway_course:
        badge = Badge.objects.get(nom="Halfway There")
        GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)

    # Badge Dedicated Learner : 3 cours terminés
    if completed_courses_count >= 3:
        badge = Badge.objects.get(nom="Dedicated Learner")
        GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)


def check_first_steps_badge(user):
    # Vérifier si le badge existe déjà
    try:
        badge = Badge.objects.get(nom="First Steps")
    except Badge.DoesNotExist:
        return

    if GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
        return

    # Accepter brouillon OU soumis
    has_attempt = TentativeExercice.objects.filter(
        utilisateur=user,
        etat__in=["brouillon", "soumis"]
    ).exists()

    if has_attempt:
        GagnerBadge.objects.create(utilisateur=user, badge=badge)



def check_marathon_coder_badge(user):
    """
    Vérifie si l'utilisateur a passé 10 heures ou plus dans la plateforme sur une seule journée.
    Si oui, attribue le badge 'Marathon Coder'.
    """
    # Date du jour actuel
    today = localtime(now()).date()

    # Somme des durées de toutes les sessions du jour
    total_seconds_today = SessionDuration.objects.filter(
        utilisateur=user,
        date__date='2025-12-29'
    ).aggregate(total=models.Sum('duration'))['total'] or 0

    print(total_seconds_today)


    if total_seconds_today >= 36000:  # 10 heures = 36000 secondes
        try:
            badge = Badge.objects.get(nom="Marathon Coder")
            GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
        except Badge.DoesNotExist:
            pass  



def check_problem_solver_badge(user):
    """
    Attribue le badge 'Problem Solver' si l'utilisateur
    a soumis au moins 10 exercices.
    """
    try:
        badge = Badge.objects.get(nom="Problem Solver")
    except Badge.DoesNotExist:
        return

    # Éviter doublons
    if GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
        return

    submitted_count = TentativeExercice.objects.filter(
        utilisateur=user,
        etat="soumis"
    ).count()

    if submitted_count >= 2:
        GagnerBadge.objects.create(utilisateur=user, badge=badge)


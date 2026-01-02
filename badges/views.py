from itertools import combinations
from django.utils.timezone import localtime, now
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from dashboard import models
from dashboard.models import SessionDuration, TentativeExercice
from quiz.models import ReponseQuiz
from users.jwt_auth import IsAuthenticatedJWT  
from rest_framework.response import Response
from .models import Badge, GagnerBadge
from django.db import models
from django.db.models import Sum


def is_student(user):
    """Retourne True si l'utilisateur est un étudiant"""
    from users.models import Etudiant
    return Etudiant.objects.filter(utilisateur=user).exists()


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

    if not is_student(user):
        return  # ne rien faire si ce n'est pas un étudiant
    
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
    if not is_student(user):
        return
    
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
    if not is_student(user):
        return
    
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
    if not is_student(user):
        return
    
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



def check_speed_demon_badge(user):
    if not is_student(user):
        return
    """
    Vérifie si l'utilisateur a réalisé 5 exercices différents en moins d'une heure,
    peu importe l'état des tentatives.
    Attribue le badge automatiquement s'il n'est pas déjà attribué.
    """
    # Récupérer toutes les tentatives de l'utilisateur, les plus récentes d'abord
    attempts = TentativeExercice.objects.filter(utilisateur=user).order_by('-created_at')
    
    # Dictionnaire : clé = exercice_id, valeur = liste des dates des tentatives
    exercises_map = {}
    for attempt in attempts:
        exo_id = attempt.exercice.id_exercice
        exercises_map.setdefault(exo_id, []).append(attempt.created_at)

    # Si moins de 5 exercices différents, pas de badge
    if len(exercises_map) < 5:
        return False

    # Vérifier toutes les combinaisons de 5 exercices différents
    for exo_combo in combinations(exercises_map.keys(), 5):
        # Pour chaque combo, récupérer la date la plus récente de chaque exercice
        dates = [exercises_map[exo][0] for exo in exo_combo]  # plus récente par exo
        dates_sorted = sorted(dates)
        if dates_sorted[-1] - dates_sorted[0] <= timedelta(hours=1):
            # Condition remplie : attribuer le badge si pas déjà attribué
            badge, _ = Badge.objects.get_or_create(nom="Speed Demon")
            if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
                GagnerBadge.objects.create(utilisateur=user, badge=badge)
            return True

    return False


def check_7day_streak_badge(user):
    if not is_student(user):
        return
    
    """
    Vérifie si l'utilisateur a résolu au moins un exercice par jour pendant 7 jours consécutifs.
    Attribue le badge automatiquement s'il n'est pas déjà attribué.
    """
    # Récupérer toutes les tentatives de l'utilisateur
    attempts = TentativeExercice.objects.filter(utilisateur=user).order_by('created_at')
    
    # Créer un set de dates uniques (jour uniquement)
    days = sorted({attempt.created_at.date() for attempt in attempts})

    streak = 1
    for i in range(1, len(days)):
        if (days[i] - days[i-1]) == timedelta(days=1):
            streak += 1
            if streak >= 7:  # équivalent du 7-day streak
                badge, _ = Badge.objects.get_or_create(nom="7 Day Streak")
                if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
                    GagnerBadge.objects.create(utilisateur=user, badge=badge)
                return True
        elif days[i] != days[i-1]:
            streak = 1  # reset si la séquence est cassée

    return False



def check_quiz_novice_badge(user):
    if not is_student(user):
        return
    """
    Vérifie si l'utilisateur a complété au moins un quiz.
    Attribue automatiquement le badge "Quiz Novice" si ce n'est pas déjà fait.
    """
    # Vérifie si l'utilisateur a déjà gagné ce badge
    badge, _ = Badge.objects.get_or_create(nom="Quiz Novice")
    if GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
        return False  # déjà attribué

    # Vérifie si l'utilisateur a complété au moins un quiz
    if ReponseQuiz.objects.filter(etudiant=user, terminer=True).exists():
        GagnerBadge.objects.create(utilisateur=user, badge=badge)
        return True

    return False


def check_quiz_whiz_badge(user, quiz):
    if not is_student(user):
        return
    """
    Vérifie si l'utilisateur a obtenu 100% dans le quiz.
    Attribue le badge automatiquement s'il n'est pas déjà attribué.
    """
    # Récupérer la dernière tentative de l'utilisateur pour ce quiz
    tentative = ReponseQuiz.objects.filter(etudiant=user, quiz=quiz, terminer=True).order_by('-date_fin').first()
    if not tentative:
        return False

    # Calculer le score maximum du quiz
    score_max = quiz.exercice.questions.aggregate(total=Sum("score"))["total"] or 0

    # Vérifier si score = score_max
    if score_max > 0 and tentative.score_total == score_max:
        # Création du badge si nécessaire
        badge, _ = Badge.objects.get_or_create(
            nom="Quiz Whiz",
            defaults={
                "description": "Get a perfect score in a quiz",
                "condition": "Obtenir 100% dans un quiz",
                "categorie": "success",
                "numpoints": 100,
                "icone": "badges/quiz_whiz.png"
            }
        )
        # Attribuer le badge s'il n'existe pas déjà
        if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
        return True

    return False


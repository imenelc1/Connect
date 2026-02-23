from itertools import combinations
from django.utils.timezone import localtime, now
from datetime import date, datetime, timedelta
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import IsAuthenticated 
from courses.models import Cours
from dashboard import models
from dashboard.models import ProgressionCours, SessionDuration, TentativeExercice
from exercices.models import Exercice
from forum.models import Commentaire, Like
from quiz.models import Quiz, ReponseQuestion, ReponseQuiz
from users.jwt_auth import IsAuthenticatedJWT 
from users.models import Utilisateur, Etudiant 
from rest_framework.response import Response
from .models import Badge, GagnerBadge
from django.db import models
from django.db.models import Sum
from django.db.models import F
from datetime import time
from django.http import JsonResponse
from .serializers import BadgeSerializer
import os                       # pour os.path.join et os.makedirs
from django.conf import settings


def is_student(user):
    """Retourne True si l'utilisateur est un étudiant"""
    from users.models import Etudiant
    return Etudiant.objects.filter(utilisateur=user).exists()

@api_view(['GET'])
def liste_badges(request):
    badges = Badge.objects.all()
    serializer = BadgeSerializer(badges, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@parser_classes([MultiPartParser, FormParser])
def modifier_badge(request, pk):
    try:
        badge = Badge.objects.get(pk=pk)
    except Badge.DoesNotExist:
        return Response({"detail": "Badge non trouvé"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()

    # Gestion icône
    if  'icone' in request.FILES:
        file = request.FILES['icone']
        # chemin relatif stocké en DB : badges/nom_image
        save_path = os.path.join("badges", file.name)
        # chemin complet sur le disque
        full_path = os.path.join(settings.MEDIA_ROOT, save_path)
        # crée le dossier si besoin
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        # écrit le fichier
        with open(full_path, "wb+") as f:
            for chunk in file.chunks():
                f.write(chunk)
        # enregistre le chemin relatif dans le modèle
        badge.icone = save_path

    # Mise à jour des autres champs
    badge.nom = data.get("nom", badge.nom)
    badge.description = data.get("description", badge.description)
    badge.categorie = data.get("categorie", badge.categorie)
    badge.condition = data.get("condition", badge.condition)
    badge.numpoints = data.get("numpoints", badge.numpoints)

    badge.save()
    serializer = BadgeSerializer(badge)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def create_badge(request):
    """
    Crée un nouveau badge et upload l'icône dans media/badges/.
    """
    data = request.data.copy()

    # Créer un nouvel objet Badge
    badge = Badge(
        nom=data.get('nom', ''),
        description=data.get('description', ''),
        categorie=data.get('categorie', 'common'),
        condition=data.get('condition', ''),
        numpoints=data.get('numpoints', 0)
    )

    # Gérer l'upload d'une icône
    if 'icone' in request.FILES:
        image = request.FILES['icone']
        # Enregistre dans media/badges/ et badge.icone.name devient 'badges/nom_image.jpg'
        badge.icone.save(image.name, image, save=False)

    # Sauvegarde le badge en base
    badge.save()

    serializer = BadgeSerializer(badge)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def delete_badge(request, pk):
    """
    Supprime un badge par son ID (pk)
    """
    try:
        badge = Badge.objects.get(pk=pk)
    except Badge.DoesNotExist:
        return Response({"error": "Badge non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    
    badge.delete()
    return Response({"success": "Badge supprimé"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])

def utilisateurs_par_badge(request, badge_id):
    try:
        badge = Badge.objects.get(id=badge_id)
    except Badge.DoesNotExist:
        return Response({"error": "Badge non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    
    # Récupérer les étudiants liés aux utilisateurs qui ont gagné ce badge
    utilisateurs = (
        Etudiant.objects
        .filter(utilisateur__gagnerbadge__badge=badge)  # join sur GagnerBadge
        .annotate(
            nom=F('utilisateur__nom'),
            prenom=F('utilisateur__prenom')
        )
        .values('nom', 'prenom', 'specialite', 'annee_etude')
    )
    
    return Response(list(utilisateurs), status=status.HTTP_200_OK)


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
            "condition": badge.condition,
            "xp": f"+{badge.numpoints} XP",
            "xpPoint": badge.numpoints,
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



def check_quiz_master_badge(user):
    """
    Vérifie si l'utilisateur a terminé au moins 10 quiz.
    Attribue le badge 'Quiz Master' si ce n'est pas déjà fait.
    """
    if not is_student(user):
        return

    # Nombre de quiz terminés par l'étudiant
    completed_quizzes_count = ReponseQuiz.objects.filter(
        etudiant=user,
        terminer=True
    ).count()

    if completed_quizzes_count >= 10:
        badge, _ = Badge.objects.get_or_create(
            nom="Quiz Master",
            defaults={
                "description": "Finish 10 quizzes",
                "condition": "Terminer 10 quiz",
                "categorie": "success",
                "numpoints": 150,
                "icone": "badges/quiz_master.png"
            }
        )

        # Vérifier si l'utilisateur n'a pas déjà le badge
        if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            return True

    return False



def check_curious_mind_badge(user):
    """
    Vérifie si l'utilisateur a répondu à au moins 50 questions de quiz.
    Attribue le badge 'Curious Mind' si ce n'est pas déjà fait.
    """
    if not is_student(user):
        return
 
    # Compter toutes les réponses associées aux tentatives terminées
    total_questions_answered = ReponseQuestion.objects.filter(
        reponse_quiz__etudiant=user,
        reponse_quiz__terminer=True
    ).count()

    if total_questions_answered >= 50:
        badge, _ = Badge.objects.get_or_create(
            nom="Curious Mind",
            defaults={
                "description": "Answer 50 total quiz questions",
                "condition": "Répondre à 50 questions de quiz au total",
                "categorie": "success",
                "numpoints": 100,
                "icone": "badges/curious_mind.png"
            }
        )

        if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            return True

    return False


@api_view(["POST"])
@permission_classes([IsAuthenticatedJWT])
def use_ai_explanation(request):
    user = request.user

    if not is_student(user):
        return Response(
            {"error": "Only students can receive this badge"},
            status=status.HTTP_403_FORBIDDEN
        )

    badge, _ = Badge.objects.get_or_create(
        nom="AI Learner",
        defaults={
            "description": "Use the AI explanation feature for the first time",
            "condition": "Utiliser la fonction d'explication IA pour la première fois",
            "categorie": "success",
            "numpoints": 50,
            "icone": "badges/ai_learner.png"
        }
    )

    gagner, created = GagnerBadge.objects.get_or_create(
        utilisateur=user,
        badge=badge
    )

    if created:
        return Response(
            {"message": "Badge AI Learner attribué"},
            status=status.HTTP_201_CREATED
        )

    return Response(
        {"message": "Badge déjà attribué"},
        status=status.HTTP_200_OK
    )



def check_all_rounder_badge(user):
    """
    Attribue le badge 'All-Rounder' si l'utilisateur a :
    - complété au moins 1 cours
    - soumis au moins 1 exercice
    - terminé au moins 1 quiz
    """
    if not is_student(user):
        return False

    from dashboard.models import ProgressionCours

    # Cours terminé
    has_completed_course = ProgressionCours.objects.filter(
        utilisateur=user,
        avancement_cours=100
    ).exists()

    # Exercice soumis
    has_submitted_exercise = TentativeExercice.objects.filter(
        utilisateur=user,
        etat="soumis"
    ).exists()

    # Quiz terminé
    has_completed_quiz = ReponseQuiz.objects.filter(
        etudiant=user,
        terminer=True
    ).exists()

    if has_completed_course and has_submitted_exercise and has_completed_quiz:
        badge, _ = Badge.objects.get_or_create(
            nom="All-Rounder",
            defaults={
                "description": "Complete one course, one exercise, and one quiz",
                "condition": "Compléter au moins un cours, un exercice et un quiz",
                "categorie": "success",
                "numpoints": 200,
                "icone": "badges/all_rounder.png"
            }
        )

        if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            return True

    return False


def check_legendary_coder_badge(user):
    if not is_student(user):
        return False

    # ---------- COURS ----------
    total_courses = Cours.objects.count()
    completed_courses = ProgressionCours.objects.filter(
        utilisateur=user,
        avancement_cours=100
    ).values("cours").distinct().count()
    print(f"COURSES : {completed_courses} / {total_courses}")
    if completed_courses < total_courses:
        print("Il reste des cours à terminer !")
        return False

    # ---------- EXERCICES (hors quiz) ----------
    # IDs des exercices qui sont liés à des quiz
    quiz_exercise_ids = list(Quiz.objects.values_list("exercice_id", flat=True))

    # Total de tous les exercices non-quiz
    total_exercises = Exercice.objects.exclude(
        id_exercice__in=quiz_exercise_ids
    ).count()

    # Exercices soumis par l'utilisateur (hors quiz)
    completed_exercises = TentativeExercice.objects.filter(
        utilisateur=user,
        etat="soumis"
    ).exclude(
        exercice__id_exercice__in=quiz_exercise_ids
    ).values("exercice").distinct().count()

    print(f"EXERCICES soumis : {completed_exercises} / {total_exercises}")

    if completed_exercises < total_exercises:
        missing_exercises = set(
            Exercice.objects.exclude(id_exercice__in=quiz_exercise_ids)
            .values_list("id_exercice", flat=True)
        ) - set(
            TentativeExercice.objects.filter(
                utilisateur=user,
                etat="soumis"
            ).exclude(
                exercice__id_exercice__in=quiz_exercise_ids
            ).values_list("exercice__id_exercice", flat=True)
        )
        print("Exercices manquants :", missing_exercises)
        return False

    # ---------- QUIZ ----------
    total_quizzes = Quiz.objects.count()
    completed_quizzes = ReponseQuiz.objects.filter(
        etudiant=user,
        terminer=True
    ).values("quiz").distinct().count()
    print(f"QUIZ : {completed_quizzes} / {total_quizzes}")
    if completed_quizzes < total_quizzes:
        print("Il reste des quiz à terminer !")
        return False

    # ---------- ATTRIBUTION DU BADGE ----------
    badge, _ = Badge.objects.get_or_create(
        nom="Legendary Coder",
        defaults={
            "description": "Complete all courses, exercises, and quizzes on the platform",
            "condition": "Compléter tous les cours, exercices et quiz de la plateforme",
            "categorie": "special",
            "numpoints": 1000,
            "icone": "badges/legendary_coder.png"
        }
    )

    gagner, created = GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
    if created:
        print("Badge Legendary Coder attribué ! 🎉")
    else:
        print("Badge Legendary Coder déjà attribué.")

    return True





def check_night_owl_badge(user):
    if not is_student(user):
        return False

    # Récupérer les tentatives soumises entre minuit et 6h
    night_submissions = TentativeExercice.objects.filter(
        utilisateur=user,
        etat="soumis",
        submitted_at__time__gte=time(0, 0),
        submitted_at__time__lt=time(6, 0)
    )

    if not night_submissions.exists():
        return False

    # Créer ou récupérer le badge
    badge, _ = Badge.objects.get_or_create(
        nom="Night Owl",
        defaults={
            "description": "Submit an exercise between midnight and 6 AM",
            "condition": "Soumettre un exercice entre 00h00 et 06h00",
            "categorie": "special",
            "numpoints": 200,
            "icone": "badges/night_owl.png"
        }
    )

    # Attribuer le badge si l'utilisateur ne l'a pas déjà
    GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
    return True



def check_top_commentateur_badge(user):
    comment_count = Commentaire.objects.filter(utilisateur=user).count()
    threshold = 20  

    if comment_count >= threshold:
        badge = Badge.objects.get(nom="Top Commentateur")
        GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
        return True
    return False



def check_top_forum_badge(user):
    """
    Badge spécial : avoir un forum qui reçoit beaucoup de likes
    Exemple : au moins 10 likes cumulés sur ses forums
    """
    # Vérifie que l'utilisateur a un profil
    if not hasattr(user, "etudiant") and not hasattr(user, "enseignant"):
        return False

    # Total likes cumulés sur tous les forums de l'utilisateur
    total_likes = Like.objects.filter(forum__utilisateur=user).count()
    print(f"Total likes reçus sur les forums de {user}: {total_likes}")

    seuil = 20
    if total_likes < seuil:
        return False

    # Création du badge si nécessaire
    badge, _ = Badge.objects.get_or_create(
        nom="Top Forum Likeur",
        defaults={
            "description": f"Avoir au moins {seuil} likes cumulés sur vos forums",
            "condition": f"Recevoir {seuil} likes cumulés sur vos forums",
            "categorie": "special",
            "numpoints": 500,
            "icone": "badges/top_forum_likeur.png"
        }
    )

    # Attribution du badge
    GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
    return True





def get_badge_streak(user):
    """
    Retourne le nombre de jours consécutifs où l'utilisateur a débloqué au moins un badge.
    """
    # Récupérer toutes les dates où l'utilisateur a gagné un badge
    badge_dates = GagnerBadge.objects.filter(utilisateur=user).order_by('date_obtention').values_list('date_obtention', flat=True)
    
    # Transformer en set de jours uniques
    # Ici on s'assure que c'est bien des datetime.date
    days = sorted({dt if isinstance(dt, date) else dt.date() for dt in badge_dates})
    
    if not days:
        return 0

    streak = 1
    max_streak = 1

    for i in range(1, len(days)):
        if (days[i] - days[i-1]) == timedelta(days=1):
            streak += 1
            if streak > max_streak:
                max_streak = streak
        elif days[i] != days[i-1]:
            streak = 1  # reset si séquence cassée

    return max_streak

def calculate_level(total_xp):
    if total_xp < 200:
        return 1
    elif total_xp < 500:
        return 2
    elif total_xp < 1000:
        return 3
    elif total_xp < 2000:
        return 4
    elif total_xp < 4000:
        return 5
    else:
        return 6


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def user_stats(request):
    user = request.user

    # Badges
    gained_ids = GagnerBadge.objects.filter(utilisateur=user).values_list('badge_id', flat=True)
    total_badges = Badge.objects.count()
    unlocked_count = len(gained_ids)

    # XP
    total_xp = GagnerBadge.objects.filter(utilisateur=user).aggregate(sum=models.Sum('badge__numpoints'))['sum'] or 0
    max_xp = Badge.objects.aggregate(sum=models.Sum('numpoints'))['sum'] or 0
    xp_pct = int((total_xp / max_xp) * 100) if max_xp else 0

    # Streak basé sur les badges
    streak_days = get_badge_streak(user)          
    streak_pct = min((streak_days / 7) * 100, 100)  # % par rapport au streak idéal de 7 jours

    level = calculate_level(total_xp)

    return Response({
    "level": level,
    "total_badges": total_badges,
    "unlocked_count": unlocked_count,
    "total_xp": total_xp,        # <-- pour l'affichage total
    "max_xp": max_xp,            # <-- pour la barre de progression
    "streak_days": streak_days,
    "streak_pct": streak_pct
    
})
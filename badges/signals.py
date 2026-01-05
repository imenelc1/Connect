from itertools import combinations
from datetime import timedelta, time
from django.utils.timezone import localtime, now
from django.db.models import Sum
from dashboard.models import ProgressionCours, SessionDuration, TentativeExercice
from exercices.models import Exercice
from quiz.models import Quiz, ReponseQuestion, ReponseQuiz
from forum.models import Commentaire, Like
from users.models import Etudiant
from .models import Badge, GagnerBadge
from feedback.models import Notification

# --------------------------
# Utilitaires
# --------------------------
def is_student(user):
    return Etudiant.objects.filter(utilisateur=user).exists()


def notify_badge(user, badge, extra_message=None):
    message = f"Félicitations ! Vous avez débloqué le badge '{badge.nom}' !"
    if extra_message:
        message = extra_message

    Notification.objects.create(
        utilisateur_destinataire=user,
        action_type='badge_unlocked',
        module_source='achievements',
        message_notif=message,
        extra_data={"badge_id": badge.id}
    )

# --------------------------
# Badges liés aux cours
# --------------------------
def check_course_badges(user, progression=None):
    if not is_student(user):
        return

    completed_courses_count = ProgressionCours.objects.filter(utilisateur=user, avancement_cours=100).count()

    # Course Explorer : 1 cours terminé
    if completed_courses_count >= 1:
        badge = Badge.objects.get(nom="Course Explorer")
        gagner, created = GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
        if created:
            notify_badge(user, badge)

    # Halfway There : 50% de progression
    halfway_course = ProgressionCours.objects.filter(utilisateur=user, avancement_cours__gte=50).exists()
    if halfway_course:
        badge = Badge.objects.get(nom="Halfway There")
        gagner, created = GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
        if created:
            notify_badge(user, badge)

    # Dedicated Learner : 3 cours terminés
    if completed_courses_count >= 3:
        badge = Badge.objects.get(nom="Dedicated Learner")
        gagner, created = GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
        if created:
            notify_badge(user, badge)

# --------------------------
# Badges liés aux exercices
# --------------------------
def check_first_steps_badge(user):
    if not is_student(user):
        return

    try:
        badge = Badge.objects.get(nom="First Steps")
    except Badge.DoesNotExist:
        return

    if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
        has_attempt = TentativeExercice.objects.filter(utilisateur=user, etat__in=["brouillon", "soumis"]).exists()
        if has_attempt:
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            notify_badge(user, badge)


def check_marathon_coder_badge(user):
    if not is_student(user):
        return

    today = localtime(now()).date()
    total_seconds_today = SessionDuration.objects.filter(utilisateur=user, date__date=today).aggregate(total=Sum('duration'))['total'] or 0

    if total_seconds_today >= 36000:  # 10 heures
        try:
            badge = Badge.objects.get(nom="Marathon Coder")
            gagner, created = GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
            if created:
                notify_badge(user, badge)
        except Badge.DoesNotExist:
            pass


def check_problem_solver_badge(user):
    if not is_student(user):
        return

    try:
        badge = Badge.objects.get(nom="Problem Solver")
    except Badge.DoesNotExist:
        return

    if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
        submitted_count = TentativeExercice.objects.filter(utilisateur=user, etat="soumis").count()
        if submitted_count >= 2:
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            notify_badge(user, badge)


def check_speed_demon_badge(user):
    if not is_student(user):
        return
    
    attempts = TentativeExercice.objects.filter(utilisateur=user).order_by('-created_at')
    exercises_map = {}
    for attempt in attempts:
        exo_id = attempt.exercice.id_exercice
        exercises_map.setdefault(exo_id, []).append(attempt.created_at)

    if len(exercises_map) < 5:
        return False

    for exo_combo in combinations(exercises_map.keys(), 5):
        dates = [exercises_map[exo][0] for exo in exo_combo]
        if max(dates) - min(dates) <= timedelta(hours=1):
            badge, _ = Badge.objects.get_or_create(nom="Speed Demon")
            if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
                GagnerBadge.objects.create(utilisateur=user, badge=badge)
                notify_badge(user, badge)
            return True
    return False


def check_7day_streak_badge(user):
    if not is_student(user):
        return

    attempts = TentativeExercice.objects.filter(utilisateur=user).order_by('created_at')
    days = sorted({attempt.created_at.date() for attempt in attempts})

    streak = 1
    for i in range(1, len(days)):
        if (days[i] - days[i-1]) == timedelta(days=1):
            streak += 1
            if streak >= 7:
                badge, _ = Badge.objects.get_or_create(nom="7 Day Streak")
                if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
                    GagnerBadge.objects.create(utilisateur=user, badge=badge)
                    notify_badge(user, badge)
                return True
        elif days[i] != days[i-1]:
            streak = 1
    return False

# --------------------------
# Badges liés aux quiz
# --------------------------
def check_quiz_novice_badge(user):
    if not is_student(user):
        return

    badge, _ = Badge.objects.get_or_create(nom="Quiz Novice")
    if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
        if ReponseQuiz.objects.filter(etudiant=user, terminer=True).exists():
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            notify_badge(user, badge)
            return True
    return False


def check_quiz_whiz_badge(user, quiz):
    if not is_student(user):
        return

    tentative = ReponseQuiz.objects.filter(etudiant=user, quiz=quiz, terminer=True).order_by('-date_fin').first()
    if not tentative:
        return False

    score_max = quiz.exercice.questions.aggregate(total=Sum("score"))["total"] or 0
    if score_max > 0 and tentative.score_total == score_max:
        badge, _ = Badge.objects.get_or_create(nom="Quiz Whiz")
        if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            notify_badge(user, badge)
        return True
    return False


def check_quiz_master_badge(user):
    if not is_student(user):
        return

    completed_quizzes_count = ReponseQuiz.objects.filter(etudiant=user, terminer=True).count()
    if completed_quizzes_count >= 10:
        badge, _ = Badge.objects.get_or_create(nom="Quiz Master")
        if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            notify_badge(user, badge)
            return True
    return False


def check_curious_mind_badge(user):
    if not is_student(user):
        return

    total_questions_answered = ReponseQuestion.objects.filter(reponse_quiz__etudiant=user, reponse_quiz__terminer=True).count()
    if total_questions_answered >= 50:
        badge, _ = Badge.objects.get_or_create(nom="Curious Mind")
        if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            notify_badge(user, badge)
        return True
    return False

# --------------------------
# Badges spéciaux
# --------------------------
def use_ai_explanation(user):
    if not is_student(user):
        return False

    badge, _ = Badge.objects.get_or_create(nom="AI Learner")
    gagner, created = GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
    if created:
        notify_badge(user, badge)
        return True
    return False


def check_all_rounder_badge(user):
    if not is_student(user):
        return False

    has_completed_course = ProgressionCours.objects.filter(utilisateur=user, avancement_cours=100).exists()
    has_submitted_exercise = TentativeExercice.objects.filter(utilisateur=user, etat="soumis").exists()
    has_completed_quiz = ReponseQuiz.objects.filter(etudiant=user, terminer=True).exists()

    if has_completed_course and has_submitted_exercise and has_completed_quiz:
        badge, _ = Badge.objects.get_or_create(nom="All-Rounder")
        if not GagnerBadge.objects.filter(utilisateur=user, badge=badge).exists():
            GagnerBadge.objects.create(utilisateur=user, badge=badge)
            notify_badge(user, badge)
        return True
    return False


def check_legendary_coder_badge(user):
    if not is_student(user):
        return False

    total_courses = ProgressionCours.objects.count()
    completed_courses = ProgressionCours.objects.filter(utilisateur=user, avancement_cours=100).values("cours").distinct().count()
    if completed_courses < total_courses:
        return False

    quiz_exercise_ids = list(Quiz.objects.values_list("exercice_id", flat=True))
    total_exercises = Exercice.objects.exclude(id_exercice__in=quiz_exercise_ids).count()
    completed_exercises = TentativeExercice.objects.filter(utilisateur=user, etat="soumis").exclude(exercice__id_exercice__in=quiz_exercise_ids).values("exercice").distinct().count()
    if completed_exercises < total_exercises:
        return False

    total_quizzes = Quiz.objects.count()
    completed_quizzes = ReponseQuiz.objects.filter(etudiant=user, terminer=True).values("quiz").distinct().count()
    if completed_quizzes < total_quizzes:
        return False

    badge, _ = Badge.objects.get_or_create(nom="Legendary Coder")
    gagner, created = GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
    if created:
        notify_badge(user, badge)
    return True


def check_night_owl_badge(user):
    if not is_student(user):
        return False

    night_submissions = TentativeExercice.objects.filter(utilisateur=user, etat="soumis", submitted_at__time__gte=time(0,0), submitted_at__time__lt=time(6,0))
    if not night_submissions.exists():
        return False

    badge, _ = Badge.objects.get_or_create(nom="Night Owl")
    GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
    notify_badge(user, badge)
    return True


def check_top_commentateur_badge(user):
    comment_count = Commentaire.objects.filter(utilisateur=user).count()
    if comment_count >= 20:
        badge, _ = Badge.objects.get_or_create(nom="Top Commentateur")
        GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
        notify_badge(user, badge)
        return True
    return False


def check_top_forum_badge(user):
    total_likes = Like.objects.filter(forum__utilisateur=user).count()
    if total_likes >= 20:
        badge, _ = Badge.objects.get_or_create(nom="Top Forum Likeur")
        GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)
        notify_badge(user, badge)
        return True
    return False

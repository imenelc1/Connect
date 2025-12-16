from datetime import timedelta
from badges.models import Badge, GagnerBadge
from dashboard.models import ProgressionCours, TentativeExercice
from courses.models import Quiz, Exercice
from django.db.models import Count, Sum
from django.utils import timezone

from ia.models import Analyse

def attribuer_badges(utilisateur):
    """
    Vérifie et attribue tous les badges à un utilisateur en se basant sur la colonne `condition` du badge.
    """
    badges = Badge.objects.all()

    for badge in badges:
        # Vérifie si le badge est déjà gagné
        if GagnerBadge.objects.filter(utilisateur=utilisateur, badge=badge).exists():
            continue

        cond = badge.condition

        # --- BADGES ---
        if cond == "first_course_completed":
            if ProgressionCours.objects.filter(utilisateur=utilisateur, avancement_cours=100).exists():
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "course_half_done":
            if ProgressionCours.objects.filter(utilisateur=utilisateur, avancement_cours__gte=50).exists():
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "three_courses_completed":
            if ProgressionCours.objects.filter(utilisateur=utilisateur, avancement_cours=100).count() >= 3:
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "ten_hours_learning":
            total = ProgressionCours.objects.filter(utilisateur=utilisateur).aggregate(total=Sum('temps_passe'))['total']
            if total and total.total_seconds() >= 36000:  # 10 heures
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "first_exercise_completed":
            if TentativeExercice.objects.filter(utilisateur=utilisateur).exists():
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "ten_exercises_completed":
            if TentativeExercice.objects.filter(utilisateur=utilisateur, score__gte=50).count() >= 10:
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "twentyfive_no_errors":
            if TentativeExercice.objects.filter(utilisateur=utilisateur, score=100).count() >= 25:
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "five_under_hour":
            if TentativeExercice.objects.filter(utilisateur=utilisateur, temps_passe__lte=timedelta(hours=1)).count() >= 5:
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "seven_day_streak":
            dates = TentativeExercice.objects.filter(utilisateur=utilisateur).values_list('date_soumission', flat=True).distinct()
            dates = sorted(list(set(dates)))
            streak = 1
            for i in range(1, len(dates)):
                if (dates[i] - dates[i-1]).days == 1:
                    streak += 1
                else:
                    streak = 1
                if streak >= 7:
                    GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)
                    break

        elif cond == "first_quiz_completed":
            if Quiz.objects.filter(exercice__tentativeexercice__utilisateur=utilisateur).exists():
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "quiz_full_score":
            if TentativeExercice.objects.filter(utilisateur=utilisateur, score=100).exists():
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "ten_quizzes_done":
            if Quiz.objects.filter(exercice__tentativeexercice__utilisateur=utilisateur).count() >= 10:
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "fifty_questions_answered":
            # Somme des questions répondues
            total_q = sum([t.exercice.question_set.count() for t in TentativeExercice.objects.filter(utilisateur=utilisateur)])
            if total_q >= 50:
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "first_ai_use":
            if Analyse.objects.filter(utilisateur=utilisateur).exists():
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "balanced_learning":
            if ProgressionCours.objects.filter(utilisateur=utilisateur).exists() and TentativeExercice.objects.filter(utilisateur=utilisateur).exists() and Analyse.objects.filter(utilisateur=utilisateur).exists():
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "complete_all":
            # Tous les cours finis, tous les exos faits et tous les quiz faits
            all_courses_done = ProgressionCours.objects.filter(utilisateur=utilisateur, avancement_cours=100).count() >= ProgressionCours.objects.count()
            all_exos_done = TentativeExercice.objects.filter(utilisateur=utilisateur).count() >= Exercice.objects.count()
            all_quizzes_done = Quiz.objects.filter(exercice__tentativeexercice__utilisateur=utilisateur).count() >= Quiz.objects.count()
            if all_courses_done and all_exos_done and all_quizzes_done:
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "active_7_days":
            last_7_days = timezone.now().date() - timedelta(days=7)
            activity_count = TentativeExercice.objects.filter(utilisateur=utilisateur, date_soumission__gte=last_7_days).count()
            if activity_count >= 7:
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

        elif cond == "night_submission":
            if TentativeExercice.objects.filter(utilisateur=utilisateur, heure_tentative__hour__gte=0, heure_tentative__hour__lte=3).exists():
                GagnerBadge.objects.create(utilisateur=utilisateur, badge=badge)

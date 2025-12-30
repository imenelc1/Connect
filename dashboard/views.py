from datetime import timedelta
from django.utils import timezone
from django.utils.timezone import now, localtime
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Avg, F
from django.db.models.functions import TruncDate
from badges.views import check_course_badges, check_first_steps_badge, check_marathon_coder_badge, check_problem_solver_badge
from courses.models import Cours, Lecon
from dashboard.serializers import TentativeExerciceReadSerializer, TentativeExerciceWriteSerializer
from exercices.models import Exercice
from exercices.serializers import ExerciceSerializer
from quiz.models import Question, Quiz, ReponseQuestion, ReponseQuiz
from spaces.models import Space, SpaceEtudiant, SpaceExo
from spaces.views import etudiant_appartient_a_lespace
from users.jwt_auth import IsAuthenticatedJWT, jwt_required
from users.models import Etudiant, Utilisateur
from .models import LeconComplete, ProgressionCours, ProgressionHistory, SessionDuration, TentativeExercice
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta
from feedback.views import FeedbackExercice
from rest_framework.exceptions import PermissionDenied
from django.db.models.functions import TruncWeek
from django.db.models import Count



@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def complete_lesson(request, lecon_id):
    user = request.user

    # Récupérer la leçon
    try:
        lecon = Lecon.objects.get(pk=lecon_id)
    except Lecon.DoesNotExist:
        return Response({"error": "Leçon introuvable"}, status=404)

    # Marquer la leçon comme complétée
    LeconComplete.objects.get_or_create(utilisateur=user, lecon=lecon)

    section = lecon.section
    cours = section.cours

    # Progression section
    total_section = Lecon.objects.filter(section=section).count()
    completed_section = LeconComplete.objects.filter(
        utilisateur=user,
        lecon__section=section
    ).count()
    section_progress = round((completed_section / total_section) * 100) if total_section > 0 else 0

    # Progression cours
    total_cours = Lecon.objects.filter(section__cours=cours).count()
    completed_cours = LeconComplete.objects.filter(
        utilisateur=user,
        lecon__section__cours=cours
    ).count()
    cours_progress = round((completed_cours / total_cours) * 100) if total_cours > 0 else 0

    # Récupérer ou créer la progression du cours
    pc, _ = ProgressionCours.objects.get_or_create(
        utilisateur=user,
        cours=cours,
        defaults={
            "avancement_cours": 0,
            "temps_passe": timedelta(seconds=0),
            "derniere_lecon": lecon
        }
    )

    # Mise à jour progression
    pc.avancement_cours = cours_progress
    pc.derniere_lecon = lecon

    # Ajouter le temps passé (envoyé depuis le frontend)
    duration = request.data.get("duration", 0)
    if duration and duration > 0:
        pc.temps_passe = (pc.temps_passe or timedelta(seconds=0)) + timedelta(seconds=duration)
    
    check_course_badges(user, pc)
    pc.save()

    # Historique
    create_progress_history(user, cours, pc.temps_passe)

    return Response({
        "section_progress": section_progress,
        "course_progress": cours_progress,
        "temps_passe": pc.temps_passe.total_seconds()
    })

@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def complete_lessons_bulk(request):
    user = request.user
    lesson_ids = request.data.get("lesson_ids", [])
    last_lesson_id = request.data.get("last_lesson_id")
    duration = request.data.get("duration", 0)  # temps passé sur toutes les leçons

    if not lesson_ids:
        return Response({"error": "No lessons provided"}, status=400)

    lessons = Lecon.objects.filter(id__in=lesson_ids)
    for lesson in lessons:
        LeconComplete.objects.get_or_create(utilisateur=user, lecon=lesson)

    cours = lessons.first().section.cours if lessons.exists() else None
    if cours:
        total_cours = Lecon.objects.filter(section__cours=cours).count()
        completed_cours = LeconComplete.objects.filter(utilisateur=user, lecon__section__cours=cours).count()
        cours_progress = round((completed_cours / total_cours) * 100)

        #  Correction : ajouter defaults pour éviter NOT NULL
        pc, created = ProgressionCours.objects.get_or_create(
            utilisateur=user,
            cours=cours,
            defaults={
                "avancement_cours": 0,
                "temps_passe": timedelta(seconds=0),
                "derniere_lecon": None
            }
        )

        pc.avancement_cours = cours_progress

        # Mettre à jour la dernière leçon
        if last_lesson_id:
            pc.derniere_lecon = Lecon.objects.get(pk=last_lesson_id)
        else:
            pc.derniere_lecon = lessons.last()

        # Ajouter le temps passé
        if duration > 0:
            pc.temps_passe = (pc.temps_passe or timedelta(seconds=0)) + timedelta(seconds=duration)
        pc.save()
        create_progress_history(user, cours, pc.avancement_cours, pc.temps_passe)
    else:
        cours_progress = 0


    check_course_badges(user, pc)
    return Response({
        "course_progress": cours_progress,
        "temps_passe": pc.temps_passe.total_seconds() if cours else 0
    })


@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def update_last_lesson(request, lesson_id):
    user = request.user
    try:
        lecon = Lecon.objects.get(pk=lesson_id)
    except Lecon.DoesNotExist:
        return Response({"error": "Lesson not found"}, status=404)

    cours = lecon.section.cours

    pc, created = ProgressionCours.objects.get_or_create(
    utilisateur=user,
    cours=cours,
    defaults={
        "avancement_cours": 0.0,
        "temps_passe": timedelta(seconds=0),
        "derniere_lecon": lecon
    }
) 

    # Ne jamais reculer
    if not pc.derniere_lecon or lecon.id_lecon >= pc.derniere_lecon.id_lecon:
        pc.derniere_lecon = lecon
        pc.save()

    return Response({"status": "ok"})

@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def reset_progress(request, cours_id):
    student = request.user
    try:
        # Supprimer les leçons complétées
        LeconComplete.objects.filter(utilisateur=student, lecon__section__cours_id=cours_id).delete()

        # Réinitialiser la progression du cours
        pc, _ = ProgressionCours.objects.get_or_create(utilisateur=student, cours_id=cours_id)
        pc.avancement_cours = 0
        pc.derniere_lecon = None
        pc.save()


        check_course_badges(student, pc)
        return Response({"status": "success", "progress": 0})
    except ProgressionCours.DoesNotExist:
        return Response({"status": "error", "message": "Progression not found"}, status=404)



@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def active_courses_count(request):
    user = request.user
    count = ProgressionCours.objects.filter(utilisateur=user, avancement_cours__gt=0).count()
    return Response({"active_courses": count})


from django.db.models import Sum

@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def add_session(request):
    if not request.user.is_authenticated:
        return Response(status=401)

    duration = int(request.data.get("duration", 0))
    if duration < 1:
        return Response({"ignored": True})

    # Vérifier si l'utilisateur a une session récente non enregistrée
    recent_sessions = SessionDuration.objects.filter(
        utilisateur=request.user
    ).order_by('-date')[:1]  # dernière session

    if recent_sessions and (duration < 300):  # si courte, cumuler
        last_session = recent_sessions[0]
        last_session.duration += duration
        last_session.save()
        return Response({"saved": True, "cumulative": True})
    else:
        SessionDuration.objects.create(
            utilisateur=request.user,
            duration=duration
        )

        check_marathon_coder_badge(request.user)
        return Response({"saved": True, "cumulative": False})





@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def daily_time(request):
    today = timezone.now().date()
    total_seconds = (
        SessionDuration.objects
        .filter(utilisateur=request.user, date__date=today)
        .aggregate(total=Sum('duration'))['total']
        or 0
    )

    hours = int(total_seconds // 3600)
    minutes = int((total_seconds % 3600) // 60)
    seconds = int(total_seconds % 60)

    return Response({
        "total_seconds": total_seconds,
        "readable": f"{hours}h {minutes}min {seconds}s"
    })


@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def success_rate(request):
    user = request.user

    # Tous les quiz tentés par l'étudiant
    tentatives = ReponseQuiz.objects.filter(etudiant=user, terminer=True)
    total_quizzes = tentatives.count()

    if total_quizzes == 0:
        return Response({"success_rate": 0})

    # Nombre de quiz réussis (score_total >= scoreMinimum)
    passed_quizzes = tentatives.filter(score_total__gte=F('quiz__scoreMinimum')).count()

    rate = (passed_quizzes / total_quizzes) * 100
    return Response({"success_rate": round(rate, 1)})


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_total_tentatives(request, student_id):
    try:
        student = Utilisateur.objects.get(id_utilisateur=student_id)
    except Utilisateur.DoesNotExist:
        return Response({"error": "Étudiant introuvable"}, status=404)

    # Tous les espaces où l'étudiant est inscrit
    spaces = Space.objects.filter(spaceetudiant__etudiant=student).distinct()

    # Tous les exercices accessibles à l'étudiant via ces espaces
    exercises = Exercice.objects.filter(spaceexo__space__in=spaces).distinct()

    total_exercises = exercises.count()

    # Nombre de tentatives soumises, sans compter les doublons par exercice
    nb_tentatives = (
        TentativeExercice.objects
        .filter(utilisateur=student, exercice__in=exercises, etat="soumis")
        .values('exercice')  # regroupe par exercice
        .distinct()
        .count()
    )

    return Response({
        "student_id": student_id,
        "total_submitted_attempts": nb_tentatives,
        "total_exercises": total_exercises
    })

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def global_progress(request):
    user = request.user

    # ---- Cours ----
    courses = Cours.objects.all()
    total_courses = courses.count() or 1
    total_course_progress = 0
    for course in courses:
        prog = ProgressionCours.objects.filter(utilisateur=user, cours=course).first()
        total_course_progress += prog.avancement_cours if prog else 0

    # ---- Exercices ----
    exercises = Exercice.objects.all()
    total_exercises = exercises.count() or 1
    total_exercise_progress = 0
    for ex in exercises:
        # On ne compte qu'une tentative max par exercice
        has_attempt = TentativeExercice.objects.filter(utilisateur=user, exercice=ex).exists()
        total_exercise_progress += 100 if has_attempt else 0

    # ---- Quiz ----
    quizzes = Quiz.objects.all()
    total_quizzes = quizzes.count() or 1
    total_quiz_progress = 0

    for quiz in quizzes:
        questions = Question.objects.filter(exercice=quiz.exercice)
        total_quiz_points = sum(q.score for q in questions) or 1

        # On prend uniquement la dernière tentative pour ce quiz
        last_rq = ReponseQuiz.objects.filter(etudiant=user, quiz=quiz).order_by('-date_fin').first()
        student_score = 0
        if last_rq:
            student_score = last_rq.reponses.aggregate(total=Sum('score_obtenu'))['total'] or 0

        total_quiz_progress += (student_score / total_quiz_points) * 100

    # ---- Moyenne globale ----
    global_progress = (
        (total_course_progress / total_courses) +
        (total_exercise_progress / total_exercises) +
        (total_quiz_progress / total_quizzes)
    ) / 3

    return Response({"global_progress": round(global_progress)})

def calculate_global_course_progress(user):
    total_courses = Cours.objects.count() or 1

    done_courses = ProgressionCours.objects.filter(
        utilisateur=user,
        avancement_cours__gte=90
    ).count()

    return (done_courses / total_courses) * 100


def calculate_global_quiz_progress(user):
    total_quizzes = Quiz.objects.count() or 1

    done_quizzes = (
        ReponseQuiz.objects
        .filter(etudiant=user)
        .values("quiz")
        .distinct()
        .count()
    )

    return (done_quizzes / total_quizzes) * 100



def create_progress_history(user, cours, temps_passe):
    global_progress = calculate_global_course_progress(user)

    ProgressionHistory.objects.create(
        utilisateur=user,
        cours=cours,
        type_contenu="cours",
        avancement=global_progress,
        temps_passe=temps_passe
    )


def create_quiz_progress_history(user, quiz, temps_passe):
    global_progress = calculate_global_quiz_progress(user)

    ProgressionHistory.objects.create(
        utilisateur=user,
        cours=quiz.exercice.cours,
        quiz=quiz,
        type_contenu="quiz",
        avancement=global_progress,
        temps_passe=temps_passe
    )




# 🔹 Historique global (7 derniers jours)
class GlobalProgressHistoryView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def get(self, request):
        user = request.user
        start_date = now().date() - timedelta(days=6)

        qs = (
            ProgressionHistory.objects
            .filter(utilisateur=user, created_at__date__gte=start_date)
            .annotate(day=TruncDate("created_at"))
            .values("day", "type_contenu")
            .annotate(avg_progress=Avg("avancement"))
        )

        # Structure par jour
        days = [start_date + timedelta(days=i) for i in range(7)]
        data = {d: {"progression_cours": 0, "progression_quiz": 0} for d in days}

        for row in qs:
            day = row["day"]
            if row["type_contenu"] == "cours":
                data[day]["progression_cours"] = round(row["avg_progress"])
            elif row["type_contenu"] == "quiz":
                data[day]["progression_quiz"] = round(row["avg_progress"])

        # Format final
        result = []
        for d in days:
            result.append({
                "date": d.strftime("%Y-%m-%d"),
                "progression_cours": data[d]["progression_cours"],
                "progression_quiz": data[d]["progression_quiz"]
            })

        return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def active_courses_count_prof(request):
    user = request.user
    # Nombre de cours créés par le prof
    count = Cours.objects.filter(utilisateur=user).count()
    return Response({"active_courses": count})


@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def average_time_prof(request):
    avg_duration = SessionDuration.objects.filter(utilisateur=request.user).aggregate(avg=Avg('duration'))['avg'] or 0
    return Response({"average_duration": avg_duration})
    

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def global_progress_students(request):
    prof = request.user

    spaces = Space.objects.filter(utilisateur=prof)

    courses = Cours.objects.filter(spacecour__space__in=spaces).distinct()

    students = Utilisateur.objects.filter(
        id_utilisateur__in=SpaceEtudiant.objects.filter(
            space__in=spaces
        ).values_list("etudiant_id", flat=True)
    )

    # ===== PROGRESSION COURS =====
    progressions = ProgressionHistory.objects.filter(
        utilisateur__in=students,
        cours__in=courses
    ).annotate(day=TruncDate("created_at"))

    course_progress = {}
    for p in progressions:
        course_progress.setdefault(p.day, {})[p.utilisateur_id] = p.avancement

    # ===== PROGRESSION QUIZ =====
    quiz_answers = ReponseQuiz.objects.filter(
    etudiant__in=students,
    quiz__spacequiz__space__in=spaces,
    terminer=True
   ).annotate(day=TruncDate("date_fin"))


    quiz_progress = {}
    for rq in quiz_answers:
        max_score = rq.quiz.exercice.questions.aggregate(
            total=Sum("score")
        )["total"] or 0

        if max_score > 0:
            percent = (rq.score_total / max_score) * 100
            quiz_progress.setdefault(rq.day, {}).setdefault(
                rq.etudiant_id, []
            ).append(percent)

    # ===== DERNIERS 7 JOURS =====
    today = now().date()
    start_date = today - timedelta(days=6)
    days = [start_date + timedelta(days=i) for i in range(7)]

    result = []

    for d in days:
        # cours
        course_total = sum(
            course_progress.get(d, {}).get(s.pk, 0)
            for s in students
        )
        course_avg = round(
            course_total / students.count(), 2
        ) if students.exists() else 0

        # quiz
        quiz_day = quiz_progress.get(d, {})
        quiz_total = 0
        for s in students:
            scores = quiz_day.get(s.pk, [])
            quiz_total += sum(scores) / len(scores) if scores else 0

        quiz_avg = round(
            quiz_total / students.count(), 2
        ) if students.exists() else 0

        result.append({
            "date": d.strftime("%Y-%m-%d"),
            "course_progress": course_avg,
            "quiz_progress": quiz_avg
        })

    return Response(result)



@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def professor_content_counts_global(request):
    prof = request.user

    # Total cours créés par le prof
    courses_count = Cours.objects.filter(utilisateur=prof).count()

    # Total exercices créés par le prof **qui ne sont pas des quiz**
    exercises_count = Exercice.objects.filter(utilisateur=prof).exclude(quiz__isnull=False).count()

    # Total quizs créés par le prof via les exercices
    quizzes_count = Quiz.objects.filter(exercice__utilisateur=prof).count()

    return Response({
        "courses_count": courses_count,
        "exercises_count": exercises_count,
        "quizzes_count": quizzes_count
    })

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def current_progress_students(request):
    prof = request.user

    # Étudiants des espaces du prof
    spaces = Space.objects.filter(utilisateur=prof)
    students = Utilisateur.objects.filter(
        id_utilisateur__in=SpaceEtudiant.objects.filter(space__in=spaces).values_list("etudiant_id", flat=True)
    )
    courses = Cours.objects.filter(spacecour__space__in=spaces).distinct()

    result = []

    for student in students:
        # ---- Cours ----
        total_course_progress = 0
        total_courses = 0
        for course in courses:
            prog = ProgressionCours.objects.filter(utilisateur=student, cours=course).first()
            if prog:
                total_course_progress += prog.avancement_cours
            total_courses += 1  # on compte tous les cours, même sans progression
        total_courses = total_courses or 1
        course_progress = total_course_progress / total_courses

        # ---- Exercices ----
        exercises = Exercice.objects.filter(cours__in=courses).exclude(quiz__isnull=False)
        total_exercise_progress = 0
        total_exercises = exercises.count() or 1
        for ex in exercises:
            attempt = TentativeExercice.objects.filter(utilisateur=student, exercice=ex).first()
            total_exercise_progress += 100 if attempt else 0
        exercise_progress = total_exercise_progress / total_exercises

        # ---- Quiz ----
        quizzes = Quiz.objects.filter(exercice__cours__in=courses)
        total_quiz_progress = 0
        total_quizzes = quizzes.count() or 1
        for quiz in quizzes:
            last_rq = ReponseQuiz.objects.filter(etudiant=student, quiz=quiz).order_by('-date_fin').first()
            if last_rq:
                questions = Question.objects.filter(exercice=quiz.exercice)
                total_quiz_points = sum(q.score for q in questions) or 1
                student_score = last_rq.reponses.aggregate(total=Sum('score_obtenu'))['total'] or 0
                total_quiz_progress += (student_score / total_quiz_points) * 100
            else:
                total_quiz_progress += 0
        quiz_progress = total_quiz_progress / total_quizzes

        # ---- Moyenne globale ----
        global_progress = (course_progress + exercise_progress + quiz_progress) / 3

        result.append({
            "student_id": student.id_utilisateur,
            "progress": round(global_progress)
        })

    return Response(result)

# exos

# ---------------- GET toutes les tentatives ----------------
@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def list_tentatives(request):
    user = request.user
    tentatives = TentativeExercice.objects.filter(utilisateur=user)
    serializer = TentativeExerciceReadSerializer(tentatives, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

class create_tentative(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def post(self, request):
        user = request.user
        exercice_id = request.data.get("exercice_id")
        etat = request.data.get("etat", "brouillon")
        overwrite = request.data.get("overwrite", False)

        if not hasattr(user, "etudiant"):
            return Response(
                {"error": "Seuls les étudiants peuvent participer aux exercices"},
                status=403
            )

        try:
            exercice = Exercice.objects.get(id_exercice=exercice_id)
        except Exercice.DoesNotExist:
            return Response({"error": "Exercice non trouvé"}, status=404)

        if etat == "soumis" and not etudiant_appartient_a_lespace(user, exercice):
            raise PermissionDenied("Vous ne pouvez pas soumettre cet exercice")

        temps_passe = timedelta(seconds=int(request.data.get("temps_passe", 0)))

        defaults = {
            "reponse": request.data.get("reponse", ""),
            "output": request.data.get("output", ""),
            "etat": etat,
            "temps_passe": temps_passe,
        }

        # ================= BROUILLON =================
        if etat == "brouillon":
            tentative, created = TentativeExercice.objects.update_or_create(
                utilisateur=user,
                exercice=exercice,
                etat="brouillon",
                defaults=defaults
            )

            #First Steps OK même en brouillon
            check_first_steps_badge(user)

        # ================= SOUMIS =================
        else:
            brouillon = TentativeExercice.objects.filter(
                utilisateur=user,
                exercice=exercice,
                etat="brouillon"
            ).first()

            if brouillon:
                brouillon.etat = "soumis"
                brouillon.reponse = defaults["reponse"]
                brouillon.output = defaults["output"]
                brouillon.temps_passe = temps_passe
                brouillon.submitted_at = now()
                brouillon.save()
                tentative = brouillon
            else:
                tentative = TentativeExercice.objects.create(
                    utilisateur=user,
                    exercice=exercice,
                    etat="soumis",
                    reponse=defaults["reponse"],
                    output=defaults["output"],
                    temps_passe=temps_passe,
                    submitted_at=now()
                )

            # BADGES après une vraie soumission
            check_first_steps_badge(user)
            check_problem_solver_badge(user)

        return Response({
            "success": "Tentative enregistrée",
            "tentative": {
                "id": tentative.id,
                "etat": tentative.etat,
                "submitted_at": tentative.submitted_at,
            }
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def get_tentative(request, tentative_id):
    user = request.user
    tentative = get_object_or_404(
        TentativeExercice,
        id=tentative_id,
        utilisateur=user
    )
    serializer = TentativeExerciceReadSerializer(tentative)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def can_submit_exercice(request, exercice_id):
    exercice = get_object_or_404(Exercice, id_exercice=exercice_id)

    # Vérifier si l'étudiant appartient à l'espace
    if not etudiant_appartient_a_lespace(request.user, exercice):
        return Response({"can_submit": False}, status=status.HTTP_200_OK)

    # Compter uniquement les tentatives soumises
    nb_soumissions = TentativeExercice.objects.filter(
        exercice=exercice,
        utilisateur=request.user,
        etat='soumis'
    ).count()

    if exercice.max_soumissions != 0 and nb_soumissions >= exercice.max_soumissions:
        # L'étudiant a atteint la limite
        return Response({"can_submit": False}, status=status.HTTP_200_OK)

    # Sinon, il peut soumettre
    return Response({"can_submit": True}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def get_student(request, student_id):
    try:
        etudiant = Etudiant.objects.select_related("utilisateur").get(utilisateur_id=student_id)
    except Etudiant.DoesNotExist:
        return Response({"error": "Étudiant introuvable"}, status=404)

    u = etudiant.utilisateur
    data = {
        "id": u.id_utilisateur,
        "nom": u.nom,
        "prenom": u.prenom,
        "adresse_email": u.adresse_email,
        "specialite": etudiant.specialite,
        "annee_etude": etudiant.annee_etude,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_exercises(request, student_id):
    prof = request.user

    try:
        student = Utilisateur.objects.get(id_utilisateur=student_id)
    except Utilisateur.DoesNotExist:
        return Response({"error": "Étudiant non trouvé"}, status=404)

    # Tous les espaces du prof où l'étudiant est inscrit
    spaces = Space.objects.filter(
        utilisateur=prof,
        spaceetudiant__etudiant=student
    ).distinct()

    # Tous les exercices du prof dans ces espaces
    exercises = Exercice.objects.filter(
        utilisateur=prof,
        spaceexo__space__in=spaces
    ).distinct()

    total_exercises = exercises.count()
    submitted_count = 0

    results = []

    for ex in exercises:
        # Récupérer TOUTES les tentatives
        tentatives = TentativeExercice.objects.filter(
            exercice=ex,
            utilisateur=student
        ).order_by("-submitted_at")
        
        # Calculer les stats
        nb_soumissions = tentatives.filter(etat="soumis").count()
        max_soumissions = ex.max_soumissions
        
        # Pour CHAQUE tentative, récupérer son feedback
        tentative_data = []
        for t in tentatives:
            # Chercher le feedback dans FeedbackExercice
            feedback_contenu = ""
            feedback_id = None
            try:
                feedback_obj = FeedbackExercice.objects.get(tentative=t)
                feedback_contenu = feedback_obj.contenu
                feedback_id = feedback_obj.id
            except FeedbackExercice.DoesNotExist:
                # Fallback sur l'ancien champ
                feedback_contenu = t.feedback if t.feedback else ""
            
            tentative_data.append({
                "id": t.id,
                "etat": t.etat,
                "reponse": t.reponse,
                "output": t.output,
                "submitted_at": t.submitted_at,
                "score": t.score,
                "feedback": feedback_contenu,  # Feedback pour CETTE tentative
                "feedback_id": feedback_id,     # ID du feedback si existe
                "numero_tentative": None,  # On va calculer ça après
            })
        
        # Calculer le numéro de chaque tentative (basé sur l'ordre de soumission)
        tentatives_soumises = [t for t in tentative_data if t["etat"] == "soumis"]
        tentatives_soumises.sort(key=lambda x: x["submitted_at"] or "1970-01-01")
        
        for i, t in enumerate(tentatives_soumises, 1):
            t["numero_tentative"] = i
        
        submitted_count += nb_soumissions

        results.append({
            "id_exercice": ex.id_exercice,
            "nom_exercice": ex.titre_exo,
            "max_soumissions": max_soumissions,
            "nb_soumissions": nb_soumissions,
            "tentatives": tentative_data  # TOUTES les tentatives avec leurs feedbacks
        })

    return Response({
        "total_exercises": total_exercises,
        "submitted_count": submitted_count,
        "exercises": results
    })

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_active_courses(request, student_id):
    prof = request.user

    try:
        student = Utilisateur.objects.get(id_utilisateur=student_id)
    except Utilisateur.DoesNotExist:
        return Response({"error": "Étudiant non trouvé"}, status=404)

    # Espaces du prof où l’étudiant est inscrit
    spaces = Space.objects.filter(utilisateur=prof, spaceetudiant__etudiant=student).distinct()

    # Cours dans ces espaces
    courses = Cours.objects.filter(spacecour__space__in=spaces).distinct()

    results = []
    for cours in courses:
        # Progression de l'étudiant dans ce cours
        pc = ProgressionCours.objects.filter(utilisateur=student, cours=cours).first()
        progress = pc.avancement_cours if pc else 0

        results.append({
            "id": cours.id_cours,
            "title": cours.titre_cour,
            "activity": f"{LeconComplete.objects.filter(utilisateur=student, lecon__section__cours=cours).count()}/{Lecon.objects.filter(section__cours=cours).count()} leçons complétées",
            "progress": pc.avancement_cours if pc else 0,
            "color": "primary"
        })

    return Response({"courses": results})

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def weekly_submission_chart(request, student_id):
    today = localtime(now())
    end_of_today = today.replace(hour=23, minute=59, second=59, microsecond=999999)

    # 6 périodes glissantes de 7 jours
    periods = []
    for i in range(6):
        period_end = end_of_today - timedelta(days=i*7)
        period_start = period_end - timedelta(days=6)
        periods.append({
            "label": f"Week {6-i}",
            "start_datetime": period_start,
            "end_datetime": period_end,
            "submissions": 0
        })
    periods = list(reversed(periods))  # du plus ancien au plus récent

    # Exercices accessibles à l'étudiant
    spaces = Space.objects.filter(spaceetudiant__etudiant_id=student_id).distinct()
    exercises = Exercice.objects.filter(spaceexo__space__in=spaces).distinct()
    total_exercises = exercises.count() or 1  # éviter division par zéro

    # Calcul des soumissions uniques par exercice par semaine
    for p in periods:
        week_submissions = TentativeExercice.objects.filter(
            utilisateur_id=student_id,
            exercice__in=exercises,
            etat="soumis",
            submitted_at__date__range=(p["start_datetime"].date(), p["end_datetime"].date())
        ).values("exercice_id").distinct().count()

        p["submissions"] = round((week_submissions / total_exercises) * 100)

        # Transformer datetime en ISO pour JSON
        p["start_date"] = p["start_datetime"].isoformat()
        p["end_date"] = p["end_datetime"].isoformat()
        del p["start_datetime"]
        del p["end_datetime"]

    return Response(periods)


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_weekly_submission_chart(request):
    user = request.user

    today = localtime(now())
    end_of_today = today.replace(hour=23, minute=59, second=59, microsecond=999999)

    # Définir 6 périodes glissantes de 7 jours
    periods = []
    for i in range(6):
        period_end = end_of_today - timedelta(days=i*7)
        period_start = period_end - timedelta(days=6)
        periods.append({
            "label": f"Week {6-i}",
            "start_datetime": period_start,
            "end_datetime": period_end,
            "submissions": 0
        })
    periods = list(reversed(periods))  # du plus ancien au plus récent

    # Exercices accessibles à l'étudiant
    spaces = Space.objects.filter(spaceetudiant__etudiant=user).distinct()
    exercises = Exercice.objects.filter(spaceexo__space__in=spaces).distinct()
    total_exercises = exercises.count() or 1  # éviter division par zéro

    # Récupérer les tentatives uniques par exercice et par semaine
    for p in periods:
        week_submissions = TentativeExercice.objects.filter(
            utilisateur=user,
            exercice__in=exercises,
            etat="soumis",
            submitted_at__date__range=(p["start_datetime"].date(), p["end_datetime"].date())
        ).values("exercice_id").distinct().count()

        p["submissions"] = round((week_submissions / total_exercises) * 100)

        # Transformer datetime en ISO
        p["start_date"] = p["start_datetime"].isoformat()
        p["end_date"] = p["end_datetime"].isoformat()
        del p["start_datetime"]
        del p["end_datetime"]

    return Response(periods)



@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def student_progress(request):
    user = request.user

    # Infos de base
    student_info = {
        "full_name": f"{user.nom} {user.prenom}",
        "email": user.adresse_email,
        
    }

    # Cours actifs + progression
    active_courses_qs = ProgressionCours.objects.filter(utilisateur=user, avancement_cours__gt=0)
    courses = [
        {
            "id": pc.cours.id_cours,
            "title": pc.cours.titre_cour,
            "progress": pc.avancement_cours,
            "color": "primary",  # tu peux mettre dynamique selon catégorie
        }
        for pc in active_courses_qs
    ]

    # Exercices soumis et total
    exercises_qs = TentativeExercice.objects.filter(utilisateur=user)
    total_exercises = exercises_qs.count()
    submitted_exercises = exercises_qs.filter(etat="soumis").count()
    submission_rate = round((submitted_exercises / total_exercises) * 100) if total_exercises else 0

   
    # Retour JSON
    return Response({
        "student": student_info,
        "courses": courses,
        "total_exercises": total_exercises,
        "submitted_exercises": submitted_exercises,
        "submission_rate": submission_rate,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_progress_score(request):
    user = request.user
    start_date = now().date() - timedelta(days=6)  # 7 derniers jours

    # Récupérer toutes les tentatives terminées de l'étudiant sur les 7 derniers jours
    quizzes = ReponseQuiz.objects.filter(
        etudiant=user,
        date_debut__date__gte=start_date,
        terminer=True
    ).order_by('date_debut')

    # Préparer un dictionnaire pour stocker le total obtenu et le total max par jour
    daily_scores = {}
    for i in range(7):
        day = start_date + timedelta(days=i)
        daily_scores[day] = {'obtained': 0, 'max': 0}

    # Calculer pour chaque quiz
    for rq in quizzes:
        day = rq.date_debut.date()
        score_obtenu = rq.score_total
        score_max = rq.quiz.exercice.questions.aggregate(total=Sum('score'))['total'] or 0

        daily_scores[day]['obtained'] += score_obtenu
        daily_scores[day]['max'] += score_max

    # Préparer les données pour le graphique
    data = []
    for day, scores in daily_scores.items():
        avg_score = (scores['obtained'] / scores['max'] * 100) if scores['max'] > 0 else 0
        data.append({
            "day": day.strftime("%a"),  # Affiche le jour abrégé (Mon, Tue, ...)
            "grade": round(avg_score, 2)
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_average_score(request):
    user = request.user
    reponses = ReponseQuiz.objects.filter(etudiant=user, terminer=True)
    total_percentages = 0
    count = 0

    for rq in reponses:
        max_score = rq.quiz.exercice.questions.aggregate(total=Sum("score"))["total"] or 0
        if max_score > 0:
            percent = (rq.score_total / max_score) * 100
            total_percentages += percent
            count += 1

    average = round(total_percentages / count, 2) if count > 0 else 0
    return Response({"average_score": average})


# ---------------- SCORE MOYEN D'UN ÉTUDIANT SELON ESPACES DU PROF ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_average_score_prof(request, student_id):
    prof = request.user
    try:
        student = Utilisateur.objects.get(id_utilisateur=student_id)
    except Utilisateur.DoesNotExist:
        return Response({"error": "Étudiant introuvable"}, status=404)

    # Espaces du prof auxquels l'étudiant appartient
    spaces = Space.objects.filter(utilisateur=prof, spaceetudiant__etudiant=student).distinct()

    # Quiz de ces espaces
    quizzes = ReponseQuiz.objects.filter(
        etudiant=student,
        quiz__spacequiz__space__in=spaces,
        terminer=True
    ).distinct()

    total_percentages = 0
    count = 0
    for rq in quizzes:
        max_score = rq.quiz.exercice.questions.aggregate(total=Sum("score"))["total"] or 0
        if max_score > 0:
            total_percentages += (rq.score_total / max_score) * 100
            count += 1

    average = round(total_percentages / count, 2) if count > 0 else 0
    return Response({"average_score": average})


# ---------------- PROGRESSION DES SCORES (7 DERNIERS JOURS) ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_progress_score_prof(request, student_id):
    prof = request.user
    try:
        student = Utilisateur.objects.get(id_utilisateur=student_id)
    except Utilisateur.DoesNotExist:
        return Response({"error": "Étudiant introuvable"}, status=404)

    start_date = now().date() - timedelta(days=6)  # derniers 7 jours

    # Espaces du prof auxquels l'étudiant appartient
    spaces = Space.objects.filter(utilisateur=prof, spaceetudiant__etudiant=student).distinct()

    quizzes = ReponseQuiz.objects.filter(
        etudiant=student,
        quiz__spacequiz__space__in=spaces,
        terminer=True,
        date_debut__date__gte=start_date
    ).distinct().order_by('date_debut')

    # Préparer un dictionnaire pour total obtenu / max par jour
    daily_scores = {start_date + timedelta(days=i): {'obtained': 0, 'max': 0} for i in range(7)}

    for rq in quizzes:
        day = rq.date_debut.date()
        score_obtenu = rq.score_total
        score_max = rq.quiz.exercice.questions.aggregate(total=Sum('score'))['total'] or 0
        daily_scores[day]['obtained'] += score_obtenu
        daily_scores[day]['max'] += score_max

    data = []
    for day, scores in daily_scores.items():
        avg_score = (scores['obtained'] / scores['max'] * 100) if scores['max'] > 0 else 0
        data.append({
            "day": day.strftime("%a"), 
            "grade": round(avg_score, 2)
        })

    return Response(data, status=status.HTTP_200_OK)




@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def quiz_success_rate_prof(request):
    prof = request.user

    spaces = Space.objects.filter(utilisateur=prof)

    attempts = ReponseQuiz.objects.filter(
        quiz__spacequiz__space__in=spaces,
        terminer=True
    )

    total_attempts = attempts.count()
    if total_attempts == 0:
        return Response({"success_rate": 0})

    success_count = 0

    for rq in attempts:
        max_score = rq.quiz.exercice.questions.aggregate(
            total=Sum("score")
        )["total"] or 0

        if max_score > 0:
            percentage = (rq.score_total / max_score) * 100
            if percentage >= 50:   # 👈 seuil de réussite
                success_count += 1

    success_rate = round((success_count / total_attempts) * 100, 2)

    return Response({"success_rate": success_rate})



@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def all_students_submissions(request):
    prof = request.user

    # Tous les espaces du prof
    spaces = Space.objects.filter(utilisateur=prof)

    # Tous les étudiants dans ces espaces
    student_ids = set(spaces.values_list("spaceetudiant__etudiant__id_utilisateur", flat=True))
    students = Utilisateur.objects.filter(id_utilisateur__in=student_ids)

    # Tous les exercices du prof dans ces espaces
    exercises = Exercice.objects.filter(utilisateur=prof, spaceexo__space__in=spaces).distinct()
    total_exercises = exercises.count()

    result = []

    for student in students:
        # compter chaque exercice au maximum 1 fois même s'il y a plusieurs tentatives
        submitted_count = TentativeExercice.objects.filter(
            exercice__in=exercises,
            utilisateur=student,
            etat="soumis"
        ).values("exercice").distinct().count()

        result.append({
            "student_id": student.id_utilisateur,
            "nom": student.nom,
            "prenom": student.prenom,
            "submitted_count": submitted_count
        })

    return Response({
        "total_exercises": total_exercises,
        "students": result
    })


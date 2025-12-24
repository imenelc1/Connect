from datetime import timedelta
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Avg
from django.db.models.functions import TruncDate
from courses.models import Cours, Lecon
from dashboard.serializers import TentativeExerciceReadSerializer, TentativeExerciceWriteSerializer
from exercices.models import Exercice
from exercices.serializers import ExerciceSerializer
from spaces.models import Space, SpaceEtudiant, SpaceExo
from spaces.views import etudiant_appartient_a_lespace
from users.jwt_auth import IsAuthenticatedJWT, jwt_required
from users.models import Etudiant, Utilisateur
from .models import LeconComplete, ProgressionCours, ProgressionHistory, SessionDuration, TentativeExercice
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta

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

    # Récupérer ou créer la progression du cours (⚠️ defaults obligatoires)
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

    pc.save()

    # Historique
    create_progress_history(user, cours, pc.avancement_cours, pc.temps_passe)

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

        return Response({"status": "success", "progress": 0})
    except ProgressionCours.DoesNotExist:
        return Response({"status": "error", "message": "Progression not found"}, status=404)



@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def active_courses_count(request):
    user = request.user
    count = ProgressionCours.objects.filter(utilisateur=user, avancement_cours__gt=0).count()
    return Response({"active_courses": count})


@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def add_session(request):
    user = request.user
    duration = request.data.get("duration", 0)
    if duration <= 0:
        return Response({"error": "Invalid duration"}, status=400)
    SessionDuration.objects.create(utilisateur=user, duration=duration)
    return Response({"message": "Session added successfully"})

@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def average_time(request):
    avg_duration = SessionDuration.objects.filter(utilisateur=request.user).aggregate(avg=Avg('duration'))['avg'] or 0
    return Response({"average_duration": avg_duration})

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def global_progress(request):
    user = request.user

    result = ProgressionCours.objects.filter(
        utilisateur=user
    ).aggregate(global_progress=Avg("avancement_cours"))

    return Response({
        "global_progress": round(result["global_progress"] or 0)
    })


def create_progress_history(user, cours, avancement, temps_passe):
    """
    Crée une entrée dans ProgressionHistory
    """
    ProgressionHistory.objects.create(
        utilisateur=user,
        cours=cours,
        avancement=avancement,
        temps_passe=temps_passe
    )


# 🔹 Historique global (7 derniers jours)
class GlobalProgressHistoryView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def get(self, request):
        user = request.user
        start_date = now().date() - timedelta(days=6)  # 7 derniers jours

        progressions = (
            ProgressionHistory.objects
            .filter(utilisateur=user, created_at__date__gte=start_date)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(progression=Avg("avancement"))
            .order_by("day")
        )

        # Remplir les jours manquants à 0
        days = [(start_date + timedelta(days=i)) for i in range(7)]
        data = []
        prog_dict = {p["day"]: round(p["progression"]) for p in progressions}
        for d in days:
            data.append({
                "date": d.strftime("%Y-%m-%d"),
                "progression": prog_dict.get(d, 0)
            })

        return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def active_courses_count_prof(request):
    user = request.user
    # Nombre de cours créés par le prof
    count = Cours.objects.filter(utilisateur=user).count()
    return Response({"active_courses": count})

@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def add_session_prof(request):
    user = request.user
    duration = request.data.get("duration", 0)
    if duration <= 0:
        return Response({"error": "Invalid duration"}, status=400)
    SessionDuration.objects.create(utilisateur=user, duration=duration)
    return Response({"message": "Session added successfully"})

@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def average_time_prof(request):
    avg_duration = SessionDuration.objects.filter(utilisateur=request.user).aggregate(avg=Avg('duration'))['avg'] or 0
    return Response({"average_duration": avg_duration})
    

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def global_progress_students(request):
    prof = request.user

    # Espaces du prof
    spaces = Space.objects.filter(utilisateur=prof)

    # Cours dans ces espaces
    courses = Cours.objects.filter(spacecour__space__in=spaces).distinct()

    # Étudiants inscrits dans ces espaces
    students = Utilisateur.objects.filter(
    id_utilisateur__in=SpaceEtudiant.objects.filter(space__in=spaces).values_list("etudiant_id", flat=True)
)

    # Historique des progressions pour ces étudiants et cours
    progressions = ProgressionHistory.objects.filter(
        utilisateur__in=students,
        cours__in=courses
    ).annotate(day=TruncDate("created_at"))

    # Préparer la période : derniers 7 jours
    today = now().date()
    start_date = today - timedelta(days=6)
    days = [(start_date + timedelta(days=i)) for i in range(7)]

    #  Construire un dictionnaire {jour: {student_id: progression}}
    progress_dict = {}
    for p in progressions:
        day_key = p.day
        if day_key not in progress_dict:
            progress_dict[day_key] = {}
        progress_dict[day_key][p.utilisateur_id] = p.avancement
        
    # Calculer la moyenne quotidienne en incluant tous les étudiants
    result = []
    for d in days:
        daily_progress = progress_dict.get(d, {})
        total_progress = sum(daily_progress.get(u.pk, 0) for u in students)
        avg = round(total_progress / students.count()) if students.exists() else 0
        result.append({
            "date": d.strftime("%Y-%m-%d"),
            "progression": avg
        })

    return Response(result)

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def current_progress_students(request):
    prof = request.user

    spaces = Space.objects.filter(utilisateur=prof)
    students = Utilisateur.objects.filter(
        id_utilisateur__in=SpaceEtudiant.objects.filter(space__in=spaces).values_list("etudiant_id", flat=True)
    )
    courses = Cours.objects.filter(spacecour__space__in=spaces).distinct()

    result = []
    for student in students:
        prog_avg = ProgressionCours.objects.filter(
            utilisateur=student,
            cours__in=courses
        ).aggregate(avg_prog=Avg("avancement_cours"))["avg_prog"] or 0

        result.append({
            "student_id": student.id_utilisateur,
            "progress": round(prog_avg)
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

# ---------------- POST nouvelle tentative ----------------
class create_tentative(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def post(self, request):
        user = request.user
        exercice_id = request.data.get("exercice_id")
        etat = request.data.get("etat", "brouillon")

        # Vérification du rôle
        if not hasattr(user, "etudiant"):
            return Response({"error": "Seuls les étudiants peuvent participer aux exercices"}, status=403)

        try:
            exercice = Exercice.objects.get(id_exercice=exercice_id)
        except Exercice.DoesNotExist:
            return Response({"error": "Exercice non trouvé"}, status=404)

        # Bloquer UNIQUEMENT la soumission
        if etat == "soumis" and not etudiant_appartient_a_lespace(user, exercice):
            raise PermissionDenied("Vous ne pouvez pas soumettre cet exercice")

        temps_passe_sec = request.data.get("temps_passe", 0)
        temps_passe = timedelta(seconds=int(temps_passe_sec))

        defaults = {
            "reponse": request.data.get("reponse", ""),
            "output": request.data.get("output", ""),
            "etat": etat,
            "temps_passe": temps_passe,
        }

        tentative, created = TentativeExercice.objects.update_or_create(
            utilisateur=user,
            exercice=exercice,
            defaults=defaults
        )

        #  Mettre à jour la date de soumission seulement ici
        if etat == "soumis":
            tentative.submitted_at = now()
            tentative.save(update_fields=["submitted_at"])


        return Response({
            "success": "Tentative enregistrée",
            "tentative": {
                "id": tentative.id,
                "etat": tentative.etat,
                "submitted_at": tentative.submitted_at,
            }
        })



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
    can_submit = etudiant_appartient_a_lespace(request.user, exercice)
    return Response({"can_submit": can_submit})

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


#prog coté proff
@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_exercises(request, student_id):
    prof = request.user

    try:
        student = Utilisateur.objects.get(id_utilisateur=student_id)
    except Utilisateur.DoesNotExist:
        return Response({"error": "Étudiant non trouvé"}, status=404)

    # tous les espaces du prof où l’étudiant est inscrit
    spaces = Space.objects.filter(
        utilisateur=prof,
        spaceetudiant__etudiant=student
    ).distinct()

    # tous les exercices du prof dans ces espaces
    exercises = Exercice.objects.filter(
        utilisateur=prof,
        spaceexo__space__in=spaces
    ).distinct()

    total_exercises = exercises.count()

    results = []
    submitted_count = 0

    for ex in exercises:
        tentative = TentativeExercice.objects.filter(
            exercice=ex,
            utilisateur=student
        ).first()

        if tentative and tentative.etat == "soumis":
            submitted_count += 1

        results.append({
            "id_exercice": ex.id_exercice,
            "nom_exercice": ex.titre_exo,
            "tentative": {
                "etat": tentative.etat,
                "reponse": tentative.reponse,
                "output": tentative.output,
                "submitted_at": tentative.submitted_at,
                "score": tentative.score,
            } if tentative else None
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
    prof = request.user

    today = now().date()
    # Lundi de la semaine courante (ISO)
    start_of_this_week = today - timedelta(days=today.weekday())

    # On remonte à 6 semaines au total
    start_date = start_of_this_week - timedelta(weeks=5)

    # Espaces du prof où l’étudiant est inscrit
    spaces = Space.objects.filter(
        utilisateur=prof,
        spaceetudiant__etudiant_id=student_id
    ).distinct()

    exercises = Exercice.objects.filter(
        utilisateur=prof,
        spaceexo__space__in=spaces
    ).distinct()

    total_exercises = exercises.count() or 1

    # Initialisation des semaines (LUNDI → DIMANCHE)
    data = []
    for i in range(6):
        week_start = start_date + timedelta(weeks=i)
        week_end = week_start + timedelta(days=6)

        data.append({
            "week": f"Week {i+1}",
            "start_date": week_start.isoformat(),
            "end_date": week_end.isoformat(),
            "submissions": 0
        })

    submissions = (
        TentativeExercice.objects.filter(
            exercice__in=exercises,
            utilisateur_id=student_id,
            etat="soumis",
            submitted_at__date__gte=start_date
        )
        .annotate(week_start=TruncWeek("submitted_at"))
        .values("week_start")
        .annotate(submissions_count=Count("id"))
    )

    # Mapping propre
    for s in submissions:
        week_index = (s["week_start"].date() - start_date).days // 7
        if 0 <= week_index < 6:
            data[week_index]["submissions"] = round(
                s["submissions_count"] / total_exercises * 100
            )

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def student_weekly_submission_chart(request):
    user = request.user
    today = now().date()

    # Lundi de la semaine courante
    start_of_this_week = today - timedelta(days=today.weekday())
    # On remonte à 6 semaines
    start_date = start_of_this_week - timedelta(weeks=5)

    # Tous les espaces où l'étudiant est inscrit
    spaces = Space.objects.filter(spaceetudiant__etudiant=user).distinct()

    # Tous les exercices disponibles pour l'étudiant dans ces espaces
    exercises = Exercice.objects.filter(spaceexo__space__in=spaces).distinct()

    total_exercises = exercises.count() or 1  # éviter division par 0

    # Initialisation des 6 semaines (LUNDI → DIMANCHE)
    data = []
    for i in range(6):
        week_start = start_date + timedelta(weeks=i)
        week_end = week_start + timedelta(days=6)
        data.append({
            "week": f"Week {i+1}",
            "start_date": week_start.isoformat(),
            "end_date": week_end.isoformat(),
            "submissions": 0
        })

    # Récupérer les tentatives soumises par l'étudiant pour ces exercices
    submissions = (
        TentativeExercice.objects.filter(
            utilisateur=user,
            exercice__in=exercises,
            etat="soumis",
            submitted_at__date__gte=start_date
        )
        .annotate(week_start=TruncWeek("submitted_at"))
        .values("week_start")
        .annotate(submissions_count=Count("id"))
        .order_by("week_start")
    )

    # Mapper chaque soumission dans la bonne semaine et convertir en %
    for s in submissions:
        week_index = (s["week_start"].date() - start_date).days // 7
        if 0 <= week_index < 6:
            data[week_index]["submissions"] = round(
                s["submissions_count"] / total_exercises * 100
            )

    return Response(data, status=status.HTTP_200_OK)


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

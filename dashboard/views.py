from datetime import timedelta
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Avg
from django.db.models.functions import TruncDate
from django.utils.timezone import now
from courses.models import Cours, Lecon
from dashboard.serializers import TentativeExerciceReadSerializer, TentativeExerciceWriteSerializer
from spaces.models import Space, SpaceEtudiant
from users.jwt_auth import IsAuthenticatedJWT
from users.models import Utilisateur
from .models import LeconComplete, ProgressionCours, ProgressionHistory, SessionDuration, TentativeExercice
from django.views.decorators.csrf import csrf_exempt


@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def complete_lesson(request, lecon_id):
    user = request.user
    lecon = Lecon.objects.get(pk=lecon_id)
    LeconComplete.objects.get_or_create(utilisateur=user, lecon=lecon)

    section = lecon.section
    cours = section.cours

    # Progression section
    total_section = Lecon.objects.filter(section=section).count()
    completed_section = LeconComplete.objects.filter(utilisateur=user, lecon__section=section).count()
    section_progress = round((completed_section / total_section) * 100)

    # Progression cours
    total_cours = Lecon.objects.filter(section__cours=cours).count()
    completed_cours = LeconComplete.objects.filter(utilisateur=user, lecon__section__cours=cours).count()
    cours_progress = round((completed_cours / total_cours) * 100)

    pc, _ = ProgressionCours.objects.get_or_create(utilisateur=user, cours=cours)
    pc.avancement_cours = cours_progress
    pc.derniere_lecon = lecon

    # Ajouter le temps passé (en secondes) depuis le frontend
    duration = request.data.get("duration", 0)
    if duration > 0:
        pc.temps_passe = (pc.temps_passe or timedelta(seconds=0)) + timedelta(seconds=duration)
        
    pc.save()
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

    lessons = Lecon.objects.filter(id_lecon__in=lesson_ids)
    for lesson in lessons:
        LeconComplete.objects.get_or_create(utilisateur=user, lecon=lesson)

    cours = lessons.first().section.cours if lessons.exists() else None
    if cours:
        total_cours = Lecon.objects.filter(section__cours=cours).count()
        completed_cours = LeconComplete.objects.filter(utilisateur=user, lecon__section__cours=cours).count()
        cours_progress = round((completed_cours / total_cours) * 100)

        # ⚡ Correction : ajouter defaults pour éviter NOT NULL
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

    pc, _ = ProgressionCours.objects.get_or_create(
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
@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def create_tentative(request):
    # On utilise le serializer d'écriture pour valider et créer/mettre à jour
    serializer = TentativeExerciceWriteSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        tentative = serializer.save(utilisateur=request.user)
        return Response(TentativeExerciceWriteSerializer(tentative).data, status=status.HTTP_201_CREATED)
    else:
        print(serializer.errors)  # <-- ajoute ça
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

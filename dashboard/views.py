from datetime import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Avg
from courses.models import Cours, Lecon
from users.jwt_auth import IsAuthenticatedJWT
from users.models import Utilisateur
from .models import LeconComplete, ProgressionCours, SessionDuration
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
    # récupérer tous les cours actifs
    courses = ProgressionCours.objects.filter(utilisateur=user)
    if not courses.exists():
        return Response({"global_progress": 0})

    total = sum(course.avancement_cours for course in courses)
    global_progress = round(total / courses.count())
    return Response({"global_progress": global_progress})


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def global_progress_history(request):
    user = request.user
    # récupérer tous les enregistrements de progression
    progressions = ProgressionCours.objects.filter(utilisateur=user).order_by('created_at')

    data = []
    for p in progressions:
        data.append({
            "date": p.created_at.strftime("%Y-%m-%d %H:%M"),  # format X
            "progression": p.avancement_cours
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
    user = request.user  # professeur
    # récupérer tous les étudiants inscrits à ses cours
    courses = Cours.objects.filter(utilisateur=user)
    students = Utilisateur.objects.filter(
        progressioncours__cours__in=courses
    ).distinct()

    # dictionnaire {date: [progressions]}
    data_dict = {}
    for student in students:
        progressions = ProgressionCours.objects.filter(utilisateur=student).order_by('created_at')
        for p in progressions:
            date_str = p.created_at.strftime("%Y-%m-%d")
            data_dict.setdefault(date_str, []).append(p.avancement_cours)

    # moyenne par jour
    result = [{"date": date, "progression": round(sum(vals)/len(vals))} for date, vals in sorted(data_dict.items())]
    return Response(result)

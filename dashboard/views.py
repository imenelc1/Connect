from datetime import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Avg
from courses.models import Cours, Lecon
from users.jwt_auth import IsAuthenticatedJWT
from .models import LeconComplete, ProgressionCours, SessionDuration
from django.views.decorators.csrf import csrf_exempt


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
    total_lecons = Lecon.objects.filter(section__cours=cours).count()
    avancement = round((completed_lecons / total_lecons) * 100)


    pc, created = ProgressionCours.objects.get_or_create(
    utilisateur=user,
    cours=cours,
    defaults={
        "avancement_cours": 0.0,
        "temps_passe": timedelta(seconds=0),
        "derniere_lecon": lecon
    }
)

#  Ne pas reculer la dernière leçon
    if not pc.derniere_lecon or lecon.id_lecon >= pc.derniere_lecon.id_lecon:
     pc.derniere_lecon = lecon

     pc.avancement_cours = avancement
     pc.save()



    return Response({"progress": avancement})

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

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, F, Q
from .models import ProgressionCours, Badge, TentativeExercice, Analyse, GagnerBadge
from courses.models import Quiz, Exercice,Question
from .serializers import ProgressionCoursSerializer, BadgeSerializer, TentativeExerciceSerializer, AnalyseSerializer, GagnerBadgeSerializer
from courses.serializers import QuizSerializer, ExerciceSerializer
from django.utils import timezone
from datetime import timedelta
from .services.badges_services import attribuer_badges
from users.models import Utilisateur

# --- Progression des cours ---
class ProgressionCoursViewSet(viewsets.ModelViewSet):
    queryset = ProgressionCours.objects.all()
    serializer_class = ProgressionCoursSerializer

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        progression = self.get_object()
        avancement = request.data.get('avancement_cours')
        temps_passe = request.data.get('temps_passe')
        if avancement is not None:
            progression.avancement_cours = avancement
        if temps_passe is not None:
            progression.temps_passe = temps_passe
        progression.save()
        # Vérifie les badges
        attribuer_badges(progression.utilisateur)
        return Response({'status': 'progress updated'})

# --- Badge ---
class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer

    @action(detail=False, methods=['get'])
    def my_badges(self, request):
        utilisateur = request.user
        badges = GagnerBadge.objects.filter(utilisateur=utilisateur)
        serializer = GagnerBadgeSerializer(badges, many=True)
        return Response(serializer.data)

# --- Tentatives d'exercices ---
class TentativeExerciceViewSet(viewsets.ModelViewSet):
    queryset = TentativeExercice.objects.all()
    serializer_class = TentativeExerciceSerializer

    def create(self, request, *args, **kwargs):
        """
        Lorsqu'un étudiant soumet un exercice :
        - on crée la tentative
        - on met à jour les badges
        """
        response = super().create(request, *args, **kwargs)
        utilisateur_id = request.data.get('utilisateur')
        from users.models import Utilisateur
        utilisateur = Utilisateur.objects.get(pk=utilisateur_id)
        attribuer_badges(utilisateur)
        return response

# --- Analyse IA ---
class AnalyseViewSet(viewsets.ModelViewSet):
    queryset = Analyse.objects.all()
    serializer_class = AnalyseSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        utilisateur_id = request.data.get('utilisateur')
        from users.models import Utilisateur
        utilisateur = Utilisateur.objects.get(pk=utilisateur_id)
        attribuer_badges(utilisateur)
        return response

# --- Quiz ---
class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

# --- Exercice ---
class ExerciceViewSet(viewsets.ModelViewSet):
    queryset = Exercice.objects.all()
    serializer_class = ExerciceSerializer

# --- Endpoint pour feed dashboard / activity feed ---
class DashboardViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        utilisateur = request.user
        progressions = ProgressionCours.objects.filter(utilisateur=utilisateur)
        serializer = ProgressionCoursSerializer(progressions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_exercises(self, request):
        utilisateur = request.user
        tentatives = TentativeExercice.objects.filter(utilisateur=utilisateur)
        serializer = TentativeExerciceSerializer(tentatives, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_ai_analyses(self, request):
        utilisateur = request.user
        analyses = Analyse.objects.filter(utilisateur=utilisateur)
        serializer = AnalyseSerializer(analyses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def charts_data(self, request):
        utilisateur = request.user
        # Exemple : progression moyenne + temps total
        progressions = ProgressionCours.objects.filter(utilisateur=utilisateur)
        if progressions.exists():
            avancement_moyen = sum([p.avancement_cours for p in progressions]) / progressions.count()
            temps_total = sum([p.temps_passe.total_seconds() for p in progressions])
        else:
            avancement_moyen = 0
            temps_total = 0

        return Response({
            'avancement_moyen': avancement_moyen,
            'temps_total_seconds': temps_total
        })
    

# maj de l'attribut avancment cour
@action(detail=False, methods=['post'])
def update_progress(self, request):
    utilisateur = request.user
    cours_id = request.data.get("cours")
    avancement = request.data.get("avancement_cours", 0)

    progression, _ = ProgressionCours.objects.get_or_create(
        utilisateur=utilisateur,
        cours_id=cours_id
    )

    # on garde le max si l'utilisateur recule
    progression.avancement_cours = max(progression.avancement_cours, avancement)
    progression.save()

    return Response({"status": "progress updated"})
  


class DashboardStatsView(APIView):

    def get(self, request):
        utilisateur = Utilisateur.objects.get(id_utilisateur=3)
        request.user = utilisateur

        # 1) AVERAGE STUDENT PROGRESS
        progressions = ProgressionCours.objects.filter(utilisateur=utilisateur)

        if progressions.exists():
            avg_progress = progressions.aggregate(
                avg=Sum("avancement_cours") / progressions.count()
            )["avg"]
        else:
            avg_progress = 0

        # 2) SUCCESS RATE (Quiz + Exercices)
        tentatives = TentativeExercice.objects.filter(utilisateur=utilisateur)
        total_attempts = tentatives.count()
        success_count = 0

        for t in tentatives:
            total_score = Question.objects.filter(
                exercice=t.exercice
            ).aggregate(s=Sum("score"))["s"] or 0

            if total_score > 0 and t.score >= total_score:
                success_count += 1

        success_rate = (success_count / total_attempts * 100) if total_attempts else 0

        # 3) ACTIVE COURSES
        active_courses = progressions.filter(
            avancement_cours__gt=0,
            avancement_cours__lt=100
        ).values("cours").distinct().count()


         # --- Temps total passé sur la plateforme ---
        temps_cours = sum([p.temps_passe.total_seconds() for p in progressions])
        tentatives = TentativeExercice.objects.filter(utilisateur=utilisateur)
        temps_exos = sum([t.temps_passe.total_seconds() for t in tentatives])
        total_time_seconds = temps_cours + temps_exos


        data = {
            "average_student_progress": round(avg_progress, 2),
            "success_rate": round(success_rate, 2),
            "active_courses": active_courses,
            "total_time_seconds": total_time_seconds
        }

        return Response(data, status=status.HTTP_200_OK)


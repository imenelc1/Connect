from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProgressionCoursViewSet,
    BadgeViewSet,
    TentativeExerciceViewSet,
    AnalyseViewSet,
    QuizViewSet,
    ExerciceViewSet,
    DashboardViewSet,
    DashboardStatsView
)

router = DefaultRouter()
router.register(r'progressions', ProgressionCoursViewSet, basename='progression')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'tentatives', TentativeExerciceViewSet, basename='tentative')
router.register(r'analyses', AnalyseViewSet, basename='analyse')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'exercices', ExerciceViewSet, basename='Exercice')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')




urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats')
]



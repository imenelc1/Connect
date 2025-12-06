from django.urls import path
from .views import (
    CreateSpaceView,
    SpaceListView,
    SpaceDetailView
)
from .views import AddStudentToSpaceView, SpaceEtudiantListView

urlpatterns = [
    path("create/", CreateSpaceView.as_view(), name="space-create"),
    path("", SpaceListView.as_view(), name="space-list"),
    path("<int:pk>/", SpaceDetailView.as_view(), name="space-detail"),
    path("add_student/", AddStudentToSpaceView.as_view(), name="add-student-to-space"),
    path("students/", SpaceEtudiantListView.as_view(), name="space-etudiant-list"),

]

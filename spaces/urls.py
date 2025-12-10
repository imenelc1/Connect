from django.urls import path
from .views import (
    CreateSpaceView,
    MySpacesStudentView,
    SpaceListView,
    SpaceDetailView,
    my_courses,
    AddStudentToSpaceView,
    SpaceEtudiantListView,
    space_courses
)

urlpatterns = [
    path("create/", CreateSpaceView.as_view(), name="space-create"),
    path("", SpaceListView.as_view(), name="space-list"),
    path("<int:id_space>/", SpaceDetailView.as_view(), name="space-detail"),
    path("add_student/", AddStudentToSpaceView.as_view(), name="add-student-to-space"),
    path("students/", SpaceEtudiantListView.as_view(), name="space-etudiant-list"),
    path("my-spaces/", MySpacesStudentView.as_view(), name="my-spaces"),
    path("<int:space_id>/courses/", space_courses),


]

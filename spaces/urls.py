from django.urls import path
from .views import (
    CreateSpaceView,
    MySpacesStudentView,
    SpaceListView,
    SpaceDetailView,
    my_courses,
    AddStudentToSpaceView,
    SpaceEtudiantListView,
    space_courses,
    remove_student_from_space
)

urlpatterns = [
    path("create/", CreateSpaceView.as_view(), name="space-create"),
    path("", SpaceListView.as_view(), name="space-list"),
    path("<int:id_space>/", SpaceDetailView.as_view(), name="space-detail"),
    path("add_student/", AddStudentToSpaceView.as_view(), name="add-student-to-space"),
    path("students/", SpaceEtudiantListView.as_view(), name="space-etudiant-list"),
    path("my-spaces/", MySpacesStudentView.as_view(), name="my-spaces"),
    path("<int:space_id>/courses/", space_courses),
    path('remove_student/<int:student_id>/', remove_student_from_space.as_view(), name='remove-student'),
    path("my-courses/", my_courses, name="my-courses"),
    path("<int:space_id>/quizzes/", space_courses, name="space-quizzes"),
    path("<int:space_id>/exercises/", space_courses, name="space-exercises"),

    path('my-courses/', my_courses, name='my-courses'), 
    path("my-quizzes/", my_courses, name="my-quizzes"),
    path("my-exercises/", my_courses, name="my-exercises"),

]

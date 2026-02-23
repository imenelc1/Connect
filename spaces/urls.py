from django.urls import path
from .views import (
    CreateSpaceView,
    MySpacesStudentView,
    SpaceListView,
    SpaceDetailView,
    my_courses,
    AddStudentToSpaceView,
    SpaceEtudiantListView,
    my_exercises,
    my_quizzes,
    space_courses,
    remove_student_from_space,
    space_exercises,
    space_quizzes,
    SpaceCreateView,
    SpaceUpdateView,
    AdminAddStudentToSpaceView,
    SpaceStudentsDetailView,
    Admin_remove_student_from_space,
    is_student_in_same_space
)

from spaces import views


urlpatterns = [
    path("create/", CreateSpaceView.as_view(), name="space-create"),
    path("", SpaceListView.as_view(), name="space-list"),
   
    path("add_student/", AddStudentToSpaceView.as_view(), name="add-student-to-space"),
    path("students/", SpaceEtudiantListView.as_view(), name="space-etudiant-list"),
    path("my-spaces/", MySpacesStudentView.as_view(), name="my-spaces"),
    
    # --- Spécifiques avant le générique ---
    
    path('<int:space_id>/exercises/', views.space_exercises, name='space_exercises'),
    path('<int:space_id>/quizzes/', views.space_quizzes, name='space_quizzes'),
    path('<int:space_id>/courses/', views.space_courses, name='space_courses'),
    
    path('remove_student/<int:student_id>/', remove_student_from_space.as_view(), name='remove-student'),
    path("my-courses/", my_courses, name="my-courses"),
    path("my-quizzes/", my_quizzes, name="my-quizzes"),
    path("my-exercises/", my_exercises, name="my-exercises"),

    # --- Générique à la fin ---
    path("<int:id_space>/", SpaceDetailView.as_view(), name="space-detail"),
    
    #---Creation modification from admin---
    path('admin/create/', SpaceCreateView.as_view(), name='create'),
    path('admin/<int:id_space>/update/', SpaceUpdateView.as_view(), name='update'),
    path('admin/add-students/', AdminAddStudentToSpaceView.as_view(), name='update'),
    
    path("space/<int:space_id>/details/", SpaceStudentsDetailView.as_view(), name="space-students"),
    path('admin/remove-student/', Admin_remove_student_from_space, name='remove-student-from-space'),
    path('space/<int:space_id>/delete/', views.delete_space, name='delete_space'),
    
    
    path(
        '<str:item_type>/<int:item_id>/student/<int:etudiant_id>/check/',
        is_student_in_same_space,
        name='check_same_space'
    ),


]
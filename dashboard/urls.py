from django.urls import path
from . import views

urlpatterns = [
 path('complete-lecon/<int:lecon_id>/', views.complete_lesson),
 path('update-last-lesson/<int:lesson_id>/', views.update_last_lesson),
 path('reset-progress/<int:cours_id>/', views.reset_progress),
 path("active/count/", views.active_courses_count, name="active-courses-count"),
 path('add-session/', views.add_session, name='add-session'),
 path('average-time/', views.average_time, name='average-time'),
 path('global-progress/', views.global_progress, name='global-progress'),
 path('complete-lessons-bulk/', views.complete_lessons_bulk, name='complete-lessons-bulk'),
 path('history/', views.GlobalProgressHistoryView.as_view(), name='global-progress-history'),
 path("prof/active/count/", views.active_courses_count_prof, name="active-courses-count-prof"),
 path ("add-session/prof/", views.add_session_prof, name="add-session-prof"),
 path ("prof/average-time/", views.average_time_prof, name="average-time-prof"),
 path ("global-progress/students/", views.global_progress_students, name="global-progress-students"),
 path ("current-progress/students/", views.current_progress_students, name="current-progress-students"),
 
]

from django.urls import path
from . import views

urlpatterns = [
 path('complete-lecon/<int:lecon_id>/', views.complete_lesson),
 path('update-last-lesson/<int:lesson_id>/', views.update_last_lesson),
 path('reset-progress/<int:cours_id>/', views.reset_progress),
 path("active/count/", views.active_courses_count, name="active-courses-count"),
 path('add-session/', views.add_session, name='add-session'),
 path('success-rate/', views.success_rate, name='success-rate'),
 path('student-total-tentatives/<int:student_id>/', views.student_total_tentatives),
 path('daily-time/', views.daily_time, name='daily-time'),
 path('global-progress/', views.global_progress, name='global-progress'),
 path('complete-lessons-bulk/', views.complete_lessons_bulk, name='complete-lessons-bulk'),
 path('history/', views.GlobalProgressHistoryView.as_view(), name='global-progress-history'),
 path("prof/active/count/", views.active_courses_count_prof, name="active-courses-count-prof"),
 path ("prof/average-time/", views.average_time_prof, name="average-time-prof"),
 path ("global-progress/students/", views.global_progress_students, name="global-progress-students"),
 path ("current-progress/students/", views.current_progress_students, name="current-progress-students"),
 path("tentatives/", views.list_tentatives, name="list_tentatives"),
 path("tentatives/create/", views.create_tentative.as_view(), name="create_tentative"),
  
path(
    "<int:exercice_id>/utilisateur/<int:user_id>/tentatives/",
    views.TentativeExerciceListView.as_view(),
    name="tentatives_exercice_utilisateur",
),
path(
    "<int:exercice_id>/utilisateur/<int:user_id>/tentativerep/",
    views.TentativeReponse.as_view(),
    name="tentatives_exercice_utilisateur",
),

 path("tentatives/id/<int:tentative_id>/", views.get_tentative, name="get-tentative"),
 path("tentatives/can-submit/<int:exercice_id>/", views.can_submit_exercice, name="can-submit-exercice"),
 path("student-exercises/<int:student_id>/", views.student_exercises, name="student-exercises"),
 path("student/<int:student_id>/", views.get_student, name="get-student"),
 path("student/active-courses/<int:student_id>/", views.student_active_courses, name="student-active-courses"),
 path("student/weekly-submission-chart/<int:student_id>/", views.weekly_submission_chart, name="weekly-submission-chart"),
 path("student/student-weekly-submission-chart/", views.student_weekly_submission_chart, name="student-weekly-submission-chart"),
 path("student/student-progress/", views.student_progress, name="student-progress"),

 path("student/student-progress-score/", views.student_progress_score, name="student-averg-score"),
 path("student/student-average-score/", views.student_average_score, name="student-average-score"),
 
 path("student/student-progress-score-prof/<int:student_id>/", views.student_progress_score_prof, name="student-progress-score-prof"),
 path("student/student-average-score-prof/<int:student_id>/", views.student_average_score_prof, name="student-average-score-prof"),

path("all-students-submissions/", views.all_students_submissions, name="all-students-submissions"),
path("quiz_success_rate_prof/", views.quiz_success_rate_prof, name="quiz_success_rate_prof"),
path("professor_content_counts_global/", views.professor_content_counts_global, name="professor_content_counts_global"),
path("tentatives/my-last/<int:exercice_id>/", views.my_last_tentative, name="my-last-tentative"),







 
]

from django.urls import path
from . import views

urlpatterns = [
 path('complete-lecon/<int:lecon_id>/', views.complete_lesson),
 path("active/count/", views.active_courses_count, name="active-courses-count"),
 path('add-session/', views.add_session, name='add-session'),
 path('average-time/', views.average_time, name='average-time'),
 path('global-progress/', views.global_progress, name='global-progress'),


]

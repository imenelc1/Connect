from django.urls import path
from . import views

urlpatterns = [
  
    path('user-badges/', views.user_badges, name='user_badges'),
    path('ai-explanation-badge/', views.use_ai_explanation, name='ai_explanation_badge'),
    path('user_stats/', views.user_stats, name='user_stats'),
    path('badge/', views.liste_badges, name='liste_badges'),
    path('badge/<int:pk>/', views.modifier_badge, name='modifier_badge'),
    path('create_badge/', views.create_badge, name='creer_badge'),
    path('badge/<int:pk>/delete/', views.delete_badge, name='delete_badge'),
    path('badge/<int:badge_id>/utilisateurs/', views.utilisateurs_par_badge, name='utilisateurs_par_badge'),

]

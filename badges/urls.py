from django.urls import path
from . import views

urlpatterns = [
  
    path('user-badges/', views.user_badges, name='user_badges'),
    path('ai-explanation-badge/', views.use_ai_explanation, name='ai_explanation_badge'),
]

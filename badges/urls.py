from django.urls import path
from . import views

urlpatterns = [
  
    path('user-badges/', views.user_badges, name='user_badges'),
]

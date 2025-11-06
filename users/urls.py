from django.urls import path
from .views import LoginView, RegisterView  # Importer les vues

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # /api/users/register/
    path('login/', LoginView.as_view(), name='login'),           # /api/users/login/
]

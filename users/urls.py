from django.urls import path
from .views import RegisterView, LoginView, AdminLoginView,UserProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('<int:pk>/', UserProfileView.as_view(), name='user-profile'),  # GET/PATCH profil utilisateur

]

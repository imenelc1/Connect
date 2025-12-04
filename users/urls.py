from django.urls import path
from .views import RegisterView, LoginView, AdminLoginView,UserProfileView,ChangePasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('profile/', UserProfileView.as_view(), name='user-profile-self'),
    path('profile/password/', ChangePasswordView.as_view(), name='change-password'),  # <-- nouveau

  # GET/PATCH profil utilisateur

]
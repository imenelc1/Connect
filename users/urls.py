from django.urls import path
from .views import RegisterView, LoginView, AdminLoginView,UserProfileView,ChangePasswordView,ForgotPasswordView,ResetPasswordView
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path("admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path('profile/', UserProfileView.as_view(), name='user-profile-self'),
    path('profile/password/', ChangePasswordView.as_view(), name='change-password'),  # <-- nouveau
    path("password/forgot/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("password/reset/", ResetPasswordView.as_view(), name="reset-password"),

  # GET/PATCH profil utilisateur

]
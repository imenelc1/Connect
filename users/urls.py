from django.urls import path
from .views import RegisterView, LoginView, AdminLoginView,UserProfileView,ChangePasswordView,ForgotPasswordView,ResetPasswordView,admin_stats, get_enseignants,get_etudiants,students_with_progress,AdminDeleteUserView, update_enseignant, update_etudiant, AdminCreateEnseignantView, AdminCreateEtudiantView, ResetPasswordView2, ProgressionUtilisateurAPIView
urlpatterns = [
    # AUTH & PROFILE
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile-self'), # Corrigé (slash ajouté)
    path('profile/password/', ChangePasswordView.as_view(), name='change-password'),
    
    # PASSWORDS
    path("password/forgot/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("password/reset/", ResetPasswordView.as_view(), name="reset-password"),
    path("users/reset-password/", ResetPasswordView2.as_view(), name='reset-password-2'),
    
    # ADMIN & DASHBOARD (Attention : tes logs montrent /api/dashboard/...)
    path("admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path("admin/stats/", admin_stats, name='admin-stats'),
    path("admin/users/<int:user_id>/", AdminDeleteUserView.as_view(), name='admin-delete-user'),
    path("admin/enseignants/create/", AdminCreateEnseignantView.as_view(), name='admin-create-enseignant'),
    path('admin/etudiants/create/', AdminCreateEtudiantView.as_view(), name='create-etudiant'),

    # UTILISATEURS / DATA
    path("enseignants/", get_enseignants, name="get_enseignants"),
    path("etudiants/", get_etudiants, name="get_etudiants"),
    path('students-with-progress/', students_with_progress, name='students-progress'),
    path('enseignants/<int:user_id>/update/', update_enseignant, name='update-enseignant'),
    path('etudiants/<int:user_id>/update/', update_etudiant, name='update-etudiant'),
    path("utilisateurs/<int:user_id>/progression/", ProgressionUtilisateurAPIView.as_view(), name="progression-utilisateur"),
]
  # GET/PATCH profil utilisateur


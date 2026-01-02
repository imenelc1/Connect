from django.urls import path
from .views import RegisterView, LoginView, AdminLoginView,UserProfileView,ChangePasswordView,ForgotPasswordView,ResetPasswordView,admin_stats, get_enseignants,get_etudiants,students_with_progress,AdminDeleteUserView, update_enseignant, update_etudiant, AdminCreateEnseignantView, AdminCreateEtudiantView, ResetPasswordView2, ProgressionUtilisateurAPIView
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path("admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path('profile/', UserProfileView.as_view(), name='user-profile-self'),
    path('profile/password/', ChangePasswordView.as_view(), name='change-password'),  # <-- nouveau
    path("password/forgot/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("password/reset/", ResetPasswordView.as_view(), name="reset-password"),
    path("admin/stats/", admin_stats),
    path("enseignants/", get_enseignants, name="get_enseignants"),
    path("etudiants/", get_etudiants),
    path('students-with-progress/', students_with_progress),
    #==========ADDED BY CHAHLA=============
    #Supprimer un etudiant, enseignant,
    path("admin/users/<int:user_id>/", AdminDeleteUserView.as_view()),
    #modifer les information d'un enseignant
    path('enseignants/<int:user_id>/update/', update_enseignant, name='update-enseignant'),
    #Modifier les informations d'un etudiant
    path('etudiants/<int:user_id>/update/', update_etudiant, name='update-etudiant'),
    #Creer un enseignant from admin
    path("admin/enseignants/create/", AdminCreateEnseignantView.as_view()),
    #Creer un etudiant from admin
    path('admin/etudiants/create/', AdminCreateEtudiantView.as_view(), name='create-etudiant'),
    #Modifier mot de passe 
    path("users/reset-password/", ResetPasswordView2.as_view()),
    
    path(
        "utilisateurs/<int:user_id>/progression/",
        ProgressionUtilisateurAPIView.as_view(),
        name="progression-utilisateur"
    ),
    


]
  # GET/PATCH profil utilisateur


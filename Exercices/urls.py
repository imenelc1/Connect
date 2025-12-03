from django.urls import path
from .views import CreateExoView, delete_exercice,  ExerciceListCreateView, ExerciceDetailView, Exercice_list_api

urlpatterns = [
    
    path('', ExerciceListCreateView.as_view(), name='Exrcice-list'),  
    path("api/exo/", Exercice_list_api, name="Exercice_api"),
    path('create/', CreateExoView.as_view(), name='create_exercice'),
    path('<int:pk>/', ExerciceDetailView.as_view(), name='Exercice-detail'),
    path("Exercice/<int:pk>/delete/", delete_exercice)   

]

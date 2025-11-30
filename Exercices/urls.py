from django.urls import path
from .views import  ExerciceListCreateView, ExerciceDetailView, Exercice_list_api

urlpatterns = [
    
    path('', ExerciceListCreateView.as_view(), name='Exrcice-list'),  
    path("api/exo/", Exercice_list_api, name="Exercice_api"),

    path('<int:pk>/', ExerciceDetailView.as_view(), name='Exercice-detail')
     
]

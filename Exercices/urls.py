from django.urls import path
from .views import  ExerciceListCreateView, ExerciceDetailView

urlpatterns = [
    
    path('', ExerciceListCreateView.as_view(), name='Exrcice-list'),  
    path('<int:pk>/', ExerciceDetailView.as_view(), name='Exercice-detail')
     
]

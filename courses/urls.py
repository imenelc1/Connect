from django.urls import path
from .views import CoursListCreateView, CoursDetailView, SectionListCreateView, LeconListCreateView, ExerciceListCreateView

urlpatterns = [
    path('', CoursListCreateView.as_view(), name='cours-list'),         
    path('<int:pk>/', CoursDetailView.as_view(), name='cours-detail'), 
    path('sections/', SectionListCreateView.as_view(), name='section-list'),  
    path('lecons/', LeconListCreateView.as_view(), name='lecon-list'),       
  
    path('exercices/', ExerciceListCreateView.as_view(), name='Exrcice-list'),  
     
]

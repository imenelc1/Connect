from django.urls import path
from .views import CoursListCreateView, CoursDetailView, SectionListCreateView, LeconListCreateView, SectionDetailView, LeconDetailView

urlpatterns = [
    path('', CoursListCreateView.as_view(), name='cours-list'),         
    path('<int:pk>/', CoursDetailView.as_view(), name='cours-detail'), 
    path('sections/', SectionListCreateView.as_view(), name='section-list'),  
    path('sections/<int:pk>', SectionDetailView.as_view(), name='section-Detail'),  
    path('lecons/', LeconListCreateView.as_view(), name='lecon-list'),  
    path('lecons/<int:pk>', LeconDetailView.as_view(), name='lecon-Detail')            
  
     
]

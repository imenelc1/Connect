
from django.urls import path
from .views import CoursListCreateView, CreateSectionView, CreateLeconView,  CreateCoursView, CoursDetailView, SectionListCreateView, LeconListCreateView, SectionDetailView, LeconDetailView
from django.urls import path
from .views import cours_list_api, delete_cours
urlpatterns = [
    path('', CoursListCreateView.as_view(), name='cours-list'),    
    path('<int:pk>/', CoursDetailView.as_view(), name='cours-detail'), 
    path('sections/', SectionListCreateView.as_view(), name='section-list'),  
    path('sections/<int:pk>', SectionDetailView.as_view(), name='section-Detail'),  
    path('lecons/', LeconListCreateView.as_view(), name='lecon-list'),  
    path("api/cours/", cours_list_api, name="cours_api"),
    path('lecons/<int:pk>', LeconDetailView.as_view(), name='lecon-Detail'),
    path('create/', CreateCoursView.as_view(), name='create_cours'),
    path("cours/<int:pk>/delete/", delete_cours),    
    path('createSection/', CreateSectionView.as_view(), name='create_Section') ,      
     path('createLesson/', CreateLeconView.as_view(), name='create_lesson'),        
     
            
  
     
]


from django.urls import path
from .views import CoursListCreateView, CoursesWithProgressView, MarkLessonVisitedView, UpdateLeconView,  CreateSectionView, CourseDetailView, CreateLeconView,  CreateCoursView, CoursDetailView, SectionListCreateView, LeconListCreateView, SectionDetailView, LeconDetailView, update_course_status,CoursSearchView
from django.urls import path
from .views import cours_list_api, delete_cours
from rest_framework.routers import DefaultRouter
urlpatterns = [
    path('', CoursListCreateView.as_view(), name='cours-list'),    
    path('<int:pk>/', CoursDetailView.as_view(), name='cours-detail'), 
    path('sections/', SectionListCreateView.as_view(), name='section-list'),  
    path('sections/<int:pk>/', SectionDetailView.as_view(), name='section-Detail'),  
    path('lecons/', LeconListCreateView.as_view(), name='lecon-list'),  
    path("api/cours/", cours_list_api, name="cours_api"),
    path('lecons/<int:pk>/', LeconDetailView.as_view(), name='lecon-Detail'),
    path('create/', CreateCoursView.as_view(), name='create_cours'),
    path("cours/<int:pk>/delete/", delete_cours),    
    path('createSection/', CreateSectionView.as_view(), name='create_Section') ,      
    path('createLesson/', CreateLeconView.as_view(), name='create_lesson'),    
    path('Lesson/<int:pk>/', UpdateLeconView.as_view(), name='update_lesson_img'),      
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),

    
    path('cours/progress/', CoursesWithProgressView.as_view(), name='courses-progress'),
    path("admin/courses/", cours_list_api, name="admin-courses"),
    path("admin/courses/create/", CreateCoursView.as_view(), name="create-cours"),
    path("admin/courses/<int:pk>/", CoursDetailView.as_view(), name="cours-detail"),
    path('lessons/<int:lesson_id>/visited/', MarkLessonVisitedView.as_view(), name='lesson-visited'),
    path("courses/admin/<int:pk>/status/", update_course_status,name="update_course_status"),
     path("cours", CoursSearchView.as_view(), name="cours-list"),
       
  
  
     
]

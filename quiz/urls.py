from django.urls import path
from .views import Quiz_api ,Quiz_list_api, QuestionListCreateView, QuizListCreateView, OptionListCreateView, QuizDetailView, QuestionDetailView, OptionDetailView

urlpatterns = [
    
    path('', QuizListCreateView.as_view(), name='Quiz-list'),  
    path('<int:pk>/', QuizDetailView.as_view(), name='Quiz-detail'),
    path('Question/', QuestionListCreateView.as_view(), name='Question-list'),  
    path('Question/<int:pk>', QuestionDetailView.as_view(), name='Question-detail'),  
    path('Option/', OptionListCreateView.as_view(), name='Option-list'),  
    path('Option/<int:pk>', OptionDetailView.as_view(), name='Option-detail'),
    path("api/quiz/", Quiz_list_api, name="quiz_api"),
    path("api/quiz/<int:exercice_id>/", Quiz_api, name="quiz"),




     
]

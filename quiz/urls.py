from django.urls import path
from .views import Quiz_api ,Quiz_list_api, QuizSearchAPIView, exercice_detail_with_quiz, toutes_les_tentatives_quiz, QuizRecapAPIView, QuizSubmitView, QuestionListCreateView, QuizListCreateView, OptionListCreateView, QuizDetailView, QuestionDetailView, OptionDetailView

urlpatterns = [
    
    path('', QuizListCreateView.as_view(), name='Quiz-list'),  
    path('<int:pk>/', QuizDetailView.as_view(), name='Quiz-detail'),
    path('Question/', QuestionListCreateView.as_view(), name='Question-list'),  
    path('Question/<int:pk>', QuestionDetailView.as_view(), name='Question-detail'),  
    path('Option/', OptionListCreateView.as_view(), name='Option-list'),  
    path('Option/<int:pk>', OptionDetailView.as_view(), name='Option-detail'),
    path("api/quiz/", Quiz_list_api, name="quiz_api"),
    path("api/quiz/<int:exercice_id>/", Quiz_api, name="quiz"),
    path("quiz/submit/", QuizSubmitView.as_view()),
    path('<int:exercice_id>/recap/', QuizRecapAPIView.as_view(), name='quiz-recap'),
    path(
        "exercice/<int:exercice_id>/utilisateur/<int:utilisateur_id>/",
        exercice_detail_with_quiz,
        name="exercice-detail-quiz"
    ),
    path(
        "<int:quiz_id>/utilisateur/<int:utilisateur_id>/",
        toutes_les_tentatives_quiz,
        name="exercice-detail-quiz_All"
    ),
    path("api/quiz", QuizSearchAPIView.as_view(), name="quiz-list"),





     
]

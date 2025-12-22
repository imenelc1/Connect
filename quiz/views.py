from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from users.jwt_auth import jwt_required
from django.utils import timezone

from exercices.models import Exercice
from datetime import timedelta
# Create your views here.
from rest_framework import generics
from quiz.models import Quiz, Question, Option, ReponseQuiz, ReponseQuestion
from .serializers import QuestionSerializer, QuizSerializer, QuizSerializer1,  OptionSerializer

class QuizListCreateView(generics.ListCreateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

# Détail, modification, suppression
class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

# Détail, modification, suppression
class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class OptionListCreateView(generics.ListCreateAPIView):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer

# Détail, modification, suppression
class OptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer
    
    

@api_view(['GET'])
def Quiz_list_api(request):
    quiz = Quiz.objects.all()
    serializer = QuizSerializer1(quiz, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def Quiz_api(request, exercice_id):
    quiz = Quiz.objects.filter(exercice_id=exercice_id)
    serializer = QuizSerializer1(quiz, many=True)
    return Response(serializer.data)




class QuizSubmitView(APIView):
    @jwt_required

    def post(self, request):
        """
        {
          quiz_id: 1,
          answers: {
            question_id: option_id
          }
        }
        """

        quiz_id = request.data.get("quiz_id")
        answers = request.data.get("answers")

        quiz = Quiz.objects.get(id=quiz_id)

        tentative = ReponseQuiz.objects.create(
            etudiant=request.user,
            quiz=quiz
        )

        score_total = 0

        for question_id, option_id in answers.items():
            question = Question.objects.get(id_qst=question_id)

            option = Option.objects.get(id_option=option_id)


            correct = option.texte_option == question.reponse_correcte
            score = question.score if correct else 0

            ReponseQuestion.objects.create(
                reponse_quiz=tentative,
                question=question,
                option_choisie=option,
                correct=correct,
                score_obtenu=score
            )

            score_total += score

        tentative.score_total = score_total
        tentative.terminer = True
        tentative.date_fin = timezone.now() 
        tentative.save()

        return Response({
            "score": score_total,
            "scoreMinimum": quiz.scoreMinimum,
            "reussi": score_total >= quiz.scoreMinimum
        })





class QuizRecapAPIView(APIView):
    @jwt_required # JWT ou session

    def get(self, request, exercice_id):
        user = request.user

        # Récupérer le quiz lié à cet exercice
        quiz = get_object_or_404(Quiz, exercice_id=exercice_id)

        # Récupérer la dernière tentative de l'utilisateur
        tentative = ReponseQuiz.objects.filter(
            quiz=quiz,
            etudiant=user
        ).order_by("-date_debut").first()

        # Préparer les questions avec options et réponse de l'utilisateur
        questions_data = []
        for question in quiz.exercice.questions.all():  # related_name="questions"
            # Options
            options_data = [
                {"id_option": opt.id_option, "texte_option": opt.texte_option}
                for opt in question.options.all()
            ]

            # Réponse sélectionnée par l'étudiant
            student_answer = None
            if tentative:
                try:
                    reponse = ReponseQuestion.objects.get(
                        question=question,
                        reponse_quiz=tentative
                    )
                    student_answer = (
                        reponse.option_choisie.id_option if reponse.option_choisie else None
                    )
                except ReponseQuestion.DoesNotExist:
                    student_answer = None

            questions_data.append({
                "id_qst": question.id_qst,
                "texte_qst": question.texte_qst,
                "score": question.score,
                "reponse_correcte": question.reponse_correcte,
                "options": options_data,
                "student_answer_id": student_answer
            })

        data = {
            "id": quiz.id,
            "scoreMinimum": quiz.scoreMinimum,
            "duration": str(quiz.duration) if quiz.duration else None,
            "duration_minutes": quiz.duration.total_seconds() // 60 if quiz.duration else None,
            "activerDuration": quiz.activerDuration,
            "nbMax_tentative": quiz.nbMax_tentative,
            "exercice": {
                "id_exercice": quiz.exercice.id_exercice,
                "titre_exo": quiz.exercice.titre_exo,
                "niveau_exo": quiz.exercice.niveau_exo,
                "niveau_exercice_label": quiz.exercice.get_niveau_exo_display(),
                "enonce": quiz.exercice.enonce,
                "categorie": quiz.exercice.categorie,
                "utilisateur": quiz.exercice.utilisateur.id_utilisateur,
                "utilisateur_name": quiz.exercice.utilisateur.nom,
                "cours": quiz.exercice.cours.id_cours,
                "visibilite_exo": quiz.exercice.visibilite_exo,
                "visibilite_exo_label": "public" if quiz.exercice.visibilite_exo else "privé",
            },
            "questions": questions_data,
            "tentative": {
                "id": tentative.id if tentative else None,
                "score_total": tentative.score_total if tentative else None,
                "date_debut": tentative.date_debut if tentative else None,
                "date_fin": tentative.date_fin if tentative else None,
                "terminer": tentative.terminer if tentative else None,
            } if tentative else None
        }

        return Response([data])
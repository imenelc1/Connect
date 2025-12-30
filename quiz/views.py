from django.shortcuts import render, get_object_or_404
from django.db.models import Q

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from dashboard.models import ProgressionHistory
from users.jwt_auth import jwt_required
from django.utils import timezone
from django.db.models import Sum

from exercices.models import Exercice
from users.models import Utilisateur
from datetime import timedelta
# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from quiz.models import Quiz, Question, Option, ReponseQuiz, ReponseQuestion
from .serializers import QuestionSerializer,ReponseQuizSerializer, QuizSerializer, QuizSerializer1,  OptionSerializer, ExerciceSerializer1



from rest_framework.decorators import api_view, permission_classes
from users.jwt_auth import IsAuthenticatedJWT  
from rest_framework.response import Response

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

        score_max = quiz.exercice.questions.aggregate(
            total=Sum("score")
        )["total"] or 0

        # 🔹 progression en %
        avancement = round((score_total / score_max) * 100) if score_max > 0 else 0

        # 🔹 historique de progression du quiz
        ProgressionHistory.objects.create(
            utilisateur=request.user,
            cours=quiz.exercice.cours,
            quiz=quiz,
            type_contenu="quiz",
            avancement=avancement,
            temps_passe=timedelta(seconds=0)
        )
        

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
    
    
    
    

#la derniere tenatative, pour recuperer le score informations sur la tentative

@api_view(["GET"])
def exercice_detail_with_quiz(request, exercice_id, utilisateur_id):
    exercice = get_object_or_404(Exercice, id_exercice=exercice_id)
    utilisateur = get_object_or_404(Utilisateur, id_utilisateur=utilisateur_id)

    # Récupérer la réponse de l'utilisateur pour ce quiz s'il existe
    try:
        quiz = exercice.quiz
        reponse_quiz = ReponseQuiz.objects.filter(quiz=quiz, etudiant=utilisateur).last()
    except Quiz.DoesNotExist:
        reponse_quiz = None

    serializer = ExerciceSerializer1(exercice, context={"reponse_quiz": reponse_quiz})
    return Response(serializer.data)

#toutes les tentatives, pour savoir si l'utilisateur peut refaire le quiz ou il a atteint le nombre max de tentative
@api_view(["GET"])
def toutes_les_tentatives_quiz(request, quiz_id, utilisateur_id):
    """
    Retourne toutes les tentatives d'un utilisateur pour un quiz donné,
    triées par date_fin décroissante.
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    utilisateur = get_object_or_404(Utilisateur, id_utilisateur=utilisateur_id)

    # Récupérer toutes les tentatives terminées (ou pas, selon le besoin)
    reponses_quiz = ReponseQuiz.objects.filter(
        quiz=quiz,
        etudiant=utilisateur
    ).order_by('-date_fin')  # dernières tentatives en premier

    if not reponses_quiz.exists():
        return Response({"message": "Aucune tentative trouvée."}, status=404)

    serializer = ReponseQuizSerializer(reponses_quiz, many=True)
    return Response(serializer.data)



#Recherche dans quiz par titre, enonce
class QuizSearchAPIView(APIView):
    """
    Retourne uniquement les Quiz (exercices avec Quiz)
    filtrés par titre, énoncé ou catégorie.
    """

    def get(self, request):
        search = request.GET.get("search", "").strip()
        categorie = request.GET.get("categorie", "").strip()

        quizzes = Quiz.objects.select_related("exercice").all()

        if search:
            quizzes = quizzes.filter(
                Q(exercice__titre_exo__icontains=search) |
                Q(exercice__enonce__icontains=search)
            )

        if categorie:
            quizzes = quizzes.filter(exercice__categorie__icontains=categorie)

        serializer = QuizSerializer1(quizzes, many=True)
        return Response(serializer.data)
from django.db.models import OuterRef

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def quizzes_faits_par_etudiant(request):
    """
    Récupère les quizzes terminés par l'utilisateur connecté.
    Retourne pour chaque quiz la dernière tentative et les infos utiles.
    """
    utilisateur = request.user  # User authentifié
    if utilisateur.is_anonymous:
        return Response({"detail": "Authentication credentials were not provided."}, status=401)

    # Récupérer toutes les tentatives terminées de l’utilisateur
    tentatives = ReponseQuiz.objects.filter(
        etudiant=utilisateur,
        terminer=True
    ).order_by('-date_fin')

    # Garder uniquement la dernière tentative par quiz
    quizzes_done = {}
    for t in tentatives:
        if t.quiz_id not in quizzes_done:
            quizzes_done[t.quiz_id] = t  # première occurrence = dernière tentative

    # Préparer les données à renvoyer
    data = []
    for tentative in quizzes_done.values():
        quiz = tentative.quiz

        score_max = quiz.exercice.questions.aggregate(total=Sum("score"))["total"] or 0
        progression = round((tentative.score_total / score_max) * 100) if score_max > 0 else 0

        data.append({
            "quiz_id": quiz.id,
            "exercice_id": quiz.exercice.id_exercice,
            "titre_exercice": quiz.exercice.titre_exo,
            "score_obtenu": tentative.score_total,
            "score_max": score_max,
            "progression": progression,
            "reussi": tentative.score_total >= quiz.scoreMinimum,
            "date_fin": tentative.date_fin,
        })

    return Response(data)
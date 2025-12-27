from rest_framework import serializers
from .models import Question, Option, Quiz, ReponseQuestion, ReponseQuiz
from exercices.serializers import ExerciceSerializer
from exercices.models import Exercice


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = '__all__'

    def validate_question(self, value):
        if value is None:
            raise serializers.ValidationError("Une option doit être liée à une question.")
        return value


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id_qst', 'texte_qst', 'reponse_correcte', 'score', 'options', 'exercice']

    # Validation pour s'assurer que l'exercice est fourni
    def validate_exercice(self, value):
        if value is None:
            raise serializers.ValidationError("L'exercice est obligatoire pour une question.")
        return value
    

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'


class QuizSerializer1(serializers.ModelSerializer):
    exercice = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()
    class Meta:
        model = Quiz
        fields = ['id', 'scoreMinimum', 'duration', 'duration_minutes', 'activerDuration', 'nbMax_tentative', 'exercice', 'questions', 'delai_entre_tentatives']

    def get_exercice(self, obj):
        # Utilisation de ton serializer complet ExerciceSerializer1
        return ExerciceSerializer(obj.exercice).data

        
    def get_questions(self, obj):
        questions = obj.exercice.questions.all()  # FK de Question vers Exercice
        return QuestionSerializer(questions, many=True).data
    def get_duration_minutes(self, obj):
        if obj.duration:
            total_seconds = obj.duration.total_seconds()  # convertir duration en secondes
            minutes = int(total_seconds // 60)  # convertir en minutes
            return minutes
        return None
    
    



class ReponseQuestionSerializer(serializers.ModelSerializer):
    option_choisie = OptionSerializer(read_only=True)

    class Meta:
        model = ReponseQuestion
        fields = ["question_id", "option_choisie", "correct", "score_obtenu"]
        
        
class QuestionSerializer1(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    reponse_utilisateur = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id_qst", "texte_qst", "reponse_correcte", "score", "options", "reponse_utilisateur"]

    def get_reponse_utilisateur(self, obj):
        reponse_quiz = self.context.get("reponse_quiz")
        if reponse_quiz:
            rq = ReponseQuestion.objects.filter(reponse_quiz=reponse_quiz, question=obj).first()
            if rq:
                return ReponseQuestionSerializer(rq).data
        return None
    
    
    
class QuizSerializer2(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    reponse_quiz_utilisateur = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ["id", "scoreMinimum", "activerDuration", "duration", "nbMax_tentative", "questions", "reponse_quiz_utilisateur"]

    def get_questions(self, obj):
        questions = obj.exercice.questions.all()
        reponse_quiz = self.context.get("reponse_quiz")
        serializer = QuestionSerializer1(questions, many=True, context={"reponse_quiz": reponse_quiz})
        return serializer.data

    def get_reponse_quiz_utilisateur(self, obj):
        reponse_quiz = self.context.get("reponse_quiz")
        if reponse_quiz:
            from rest_framework.fields import DateTimeField
            return {
                "id": reponse_quiz.id,
                "date_debut": DateTimeField().to_representation(reponse_quiz.date_debut),
                "date_fin": DateTimeField().to_representation(reponse_quiz.date_fin),
                "score_total": reponse_quiz.score_total,
                "terminer": reponse_quiz.terminer
            }
        return None
    
    
class ExerciceSerializer1(serializers.ModelSerializer):
    quiz = serializers.SerializerMethodField()

    class Meta:
        model = Exercice
        fields = ["id_exercice", "titre_exo", "enonce", "niveau_exo", "categorie", "visibilite_exo", "cours", "quiz"]

    def get_quiz(self, obj):
        try:
            quiz = obj.quiz
        except Quiz.DoesNotExist:
            return None
        reponse_quiz = self.context.get("reponse_quiz")
        serializer = QuizSerializer2(quiz, context={"reponse_quiz": reponse_quiz})
        return serializer.data
    
    
    
class ReponseQuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReponseQuiz
        fields = ["etudiant", "quiz", "date_debut", "date_fin", "score_total", "terminer"]

from django.contrib import admin
from .models import Quiz, Question, Option

# ------------------------------
# Quiz
# ------------------------------
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'exercice')
    search_fields = ('exercice__titre_exo',)  # permet de chercher par titre de l'exercice
    list_filter = ('exercice',)


# ------------------------------
# Question
# ------------------------------
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('texte_qst', 'exercice', 'score')
    search_fields = ('texte_qst', 'exercice__titre_exo')
    list_filter = ('exercice',)


# ------------------------------
# Option
# ------------------------------
@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('texte_option', 'question')
    search_fields = ('texte_option', 'question__texte_qst')
    list_filter = ('question',)

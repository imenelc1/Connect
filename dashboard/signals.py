from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from dashboard.models import TentativeExercice
from feedback.models import Notification

@receiver(post_save, sender=TentativeExercice)
def notify_prof_on_submission(sender, instance, created, **kwargs):
    """
    Crée une notification pour le prof quand un étudiant soumet un exercice.
    Évite les doublons.
    """
    # Ne créer la notif que si l'état est soumis
    if instance.etat != "soumis":
        return

    exercice = instance.exercice
    student = instance.utilisateur
    prof = exercice.utilisateur  # le prof lié à l'exercice

    content_type = ContentType.objects.get_for_model(TentativeExercice)

    # Vérifie si la notification existe déjà
    existing = Notification.objects.filter(
        content_type=content_type,
        object_id=instance.id,
        action_type="submission",
        utilisateur_destinataire=prof,
        utilisateur_envoyeur=student
    ).exists()

    if existing:
        return  # notification déjà créée, on ne fait rien

    # Sinon, créer la notification
    Notification.objects.create(
        utilisateur_destinataire=prof,
        utilisateur_envoyeur=student,
        message_notif=f"L'étudiant {student.nom} {student.prenom} a soumis une solution de l'exercice '{exercice.titre_exo}'",
        content_type=content_type,
        object_id=instance.id,
        action_type="submission",
        module_source="exercice",
        extra_data={
            "exercice_id": exercice.id_exercice,
            "student_id": student.id_utilisateur
        }
    )
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType

from feedback.models import FeedbackExercice
from dashboard.models import TentativeExercice
from feedback.models import Notification


@receiver(post_save, sender=FeedbackExercice)
def notify_student_on_feedback(sender, instance, created, **kwargs):
    """
    Notifie l'étudiant quand un professeur écrit ou modifie un feedback
    """

    tentative = instance.tentative
    exercice = instance.exercice
    student = tentative.utilisateur
    prof = instance.auteur

    content_type = ContentType.objects.get_for_model(FeedbackExercice)

    # ❌ éviter doublons : un feedback par tentative
    existing = Notification.objects.filter(
        content_type=content_type,
        object_id=instance.id,
        action_type="feedback",
        utilisateur_destinataire=student,
        utilisateur_envoyeur=prof
    ).exists()

    if existing:
        return

    Notification.objects.create(
        utilisateur_destinataire=student,
        utilisateur_envoyeur=prof,
        message_notif=(
            f"Le professeur {prof.nom} {prof.prenom} a laissé un feedback "
            f"sur votre solution de l'exercice '{exercice.titre_exo}'"
        ),
        content_type=content_type,
        object_id=instance.id,
        action_type="feedback",
        module_source="exercice",
        extra_data={
            "tentative_id": tentative.id,
            "exercice_id": exercice.id_exercice
        }
    )



# dashboard/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta, datetime
from django.db.models import Sum, Count
from django.contrib.contenttypes.models import ContentType

from feedback.utils import create_notification
from .models import (
    LeconComplete, 
    ProgressionCours, 
    TentativeExercice,
    SessionDuration,
    ProgressionHistory
)
from quiz.models import ReponseQuiz, Quiz
from courses.models import Cours, Lecon, Section
from exercices.models import Exercice
from users.models import Utilisateur, Etudiant
import math

# ============================================================================
# 1. SIGNAL: Leçon complétée
# ============================================================================
@receiver(post_save, sender=LeconComplete)
def handle_lesson_completed(sender, instance, created, **kwargs):
    """
    Gère les notifications lorsqu'une leçon est complétée
    """
    if not created:
        return
    
    lecon = instance.lecon
    user = instance.utilisateur
    section = lecon.section
    cours = section.cours
    
    # ========= NOTIFICATION BASIQUE =========
    create_notification(
        destinataire=user,
        action_type='lesson_completed',
        module_source='courses',
        content_object=lecon,
        message=f"✅ Leçon '{lecon.titre_lecon}' terminée !"
    )
    
    # ========= PROGRESSION DE LA SECTION =========
    total_section = Lecon.objects.filter(section=section).count()
    completed_section = LeconComplete.objects.filter(
        utilisateur=user,
        lecon__section=section
    ).count()
    section_progress = (completed_section / total_section * 100) if total_section > 0 else 0
    
    # Notification pour section complète
    if section_progress >= 100:
        create_notification(
            destinataire=user,
            action_type='section_completed',
            module_source='courses',
            content_object=section,
            message=f"🎯 Section '{section.titre_section}' terminée !"
        )
    
    # ========= PROGRESSION DU COURS =========
    total_cours = Lecon.objects.filter(section__cours=cours).count()
    completed_cours = LeconComplete.objects.filter(
        utilisateur=user,
        lecon__section__cours=cours
    ).count()
    cours_progress = (completed_cours / total_cours * 100) if total_cours > 0 else 0
    
    # Mettre à jour ProgressionCours
    progression_cours, _ = ProgressionCours.objects.get_or_create(
        utilisateur=user,
        cours=cours,
        defaults={'avancement_cours': cours_progress, 'derniere_lecon': lecon}
    )
    progression_cours.avancement_cours = cours_progress
    progression_cours.derniere_lecon = lecon
    progression_cours.save()
    
    # ========= NOTIFICATIONS DE JALONS DU COURS =========
    milestones = {
        25: "🚀 Démarrage impressionnant ! Vous avez complété 25% du cours.",
        50: "🎯 À mi-chemin ! Vous avez terminé la moitié du cours.",
        75: "💪 Plus que 25% ! Vous approchez de la fin.",
        90: "🔥 Presque terminé ! Plus que 10% à compléter.",
        100: "🏆 FÉLICITATIONS ! Vous avez terminé le cours !"
    }
    
    for milestone, message in milestones.items():
        if progression_cours._previous_progress < milestone <= cours_progress:
            create_notification(
                destinataire=user,
                action_type=f'course_milestone_{milestone}',
                module_source='courses',
                content_object=cours,
                message=f"{message} ({cours.titre_cour})"
            )
    
    # ========= PREMIÈRE LEÇON =========
    if completed_cours == 1:
        create_notification(
            destinataire=user,
            action_type='first_lesson',
            module_source='courses',
            message=f"🌟 Première leçon terminée ! Bienvenue dans '{cours.titre_cour}'"
        )
    
    # ========= PROGRESSION JOURNALIÈRE =========
    today = timezone.now().date()
    lessons_today = LeconComplete.objects.filter(
        utilisateur=user,
        date__date=today
    ).count()
    
    if lessons_today == 3:
        create_notification(
            destinataire=user,
            action_type='daily_goal',
            module_source='progress',
            message="📚 Objectif quotidien atteint ! 3 leçons terminées aujourd'hui."
        )
    elif lessons_today == 5:
        create_notification(
            destinataire=user,
            action_type='daily_master',
            module_source='progress',
            message="🔥 Incroyable ! 5 leçons terminées aujourd'hui !"
        )

# ============================================================================
# 2. SIGNAL: Suivi de la progression du cours
# ============================================================================
@receiver(pre_save, sender=ProgressionCours)
def track_progress_change(sender, instance, **kwargs):
    """Stocke l'ancienne progression pour détecter les changements"""
    if instance.pk:
        try:
            old = ProgressionCours.objects.get(pk=instance.pk)
            instance._previous_progress = old.avancement_cours
        except ProgressionCours.DoesNotExist:
            instance._previous_progress = 0
    else:
        instance._previous_progress = 0

@receiver(post_save, sender=ProgressionCours)
def notify_progress_achievements(sender, instance, created, **kwargs):
    """Notifie les réalisations de progression"""
    if created:
        return
    
    user = instance.utilisateur
    cours = instance.cours
    
    # Vérifier si c'est le premier cours avec progression
    if instance.avancement_cours > 0:
        active_courses = ProgressionCours.objects.filter(
            utilisateur=user,
            avancement_cours__gt=0
        ).count()
        
        if active_courses == 1:
            create_notification(
                destinataire=user,
                action_type='first_active_course',
                module_source='progress',
                content_object=cours,
                message=f"🎬 Votre premier cours en cours : '{cours.titre_cour}'"
            )


# ============================================================================
# 5. SIGNAL: Quiz complété
# ============================================================================
@receiver(post_save, sender=ReponseQuiz)
def handle_quiz_completion(sender, instance, created, **kwargs):
    """
    Gère les notifications pour les quiz complétés
    """
    if not instance.terminer or not created:
        return
    
    user = instance.etudiant
    quiz = instance.quiz
    
    # ========= CALCUL DU SCORE =========
    max_score = quiz.exercice.questions.aggregate(total=Sum('score'))['total'] or 0
    percentage = (instance.score_total / max_score * 100) if max_score > 0 else 0
    
    # ========= NOTIFICATION BASÉE SUR LE SCORE =========
    if percentage >= 90:
        message = f"🏆 EXCELLENT ! {percentage:.0f}% au quiz '{quiz.exercice.titre_exo}'"
        action_type = 'quiz_excellent'
    elif percentage >= 70:
        message = f"🎯 Très bien ! {percentage:.0f}% au quiz '{quiz.exercice.titre_exo}'"
        action_type = 'quiz_good'
    elif percentage >= 50:
        message = f"👍 Bon travail ! {percentage:.0f}% au quiz '{quiz.exercice.titre_exo}'"
        action_type = 'quiz_passed'
    else:
        message = f"📚 {percentage:.0f}% au quiz. Continuez à vous entraîner !"
        action_type = 'quiz_retry'
    
    create_notification(
        destinataire=user,
        action_type=action_type,
        module_source='quiz',
        content_object=quiz,
        message=message,
        extra_data={
            'score': instance.score_total,
            'max_score': max_score,
            'percentage': percentage
        }
    )
    
    # ========= PREMIER QUIZ =========
    total_quizzes = ReponseQuiz.objects.filter(
        etudiant=user,
        terminer=True
    ).count()
    
    if total_quizzes == 1:
        create_notification(
            destinataire=user,
            action_type='first_quiz',
            module_source='progress',
            message="🧠 Premier quiz complété ! Vous maîtrisez maintenant les bases."
        )
    
    # ========= STREAK DE QUIZ =========
    today = timezone.now().date()
    quizzes_today = ReponseQuiz.objects.filter(
        etudiant=user,
        terminer=True,
        date_fin__date=today
    ).count()
    
    if quizzes_today == 2:
        create_notification(
            destinataire=user,
            action_type='quiz_streak',
            module_source='progress',
            message="⚡ 2 quiz complétés aujourd'hui ! Votre cerveau est en feu !"
        )

# ============================================================================
# 6. SIGNAL: Session de travail
# ============================================================================
@receiver(post_save, sender=SessionDuration)
def handle_study_session(sender, instance, created, **kwargs):
    """
    Gère les notifications pour les sessions d'étude
    """
    if not created:
        return
    
    user = instance.utilisateur
    duration = instance.duration
    
    # ========= SESSIONS LONGUES =========
    if duration >= 7200:  # 2 heures
        hours = duration // 3600
        minutes = (duration % 3600) // 60
        create_notification(
            destinataire=user,
            action_type='marathon_session',
            module_source='progress',
            message=f"🔥 Marathon ! {hours}h{minutes}min de concentration intense !"
        )
    elif duration >= 3600:  # 1 heure
        hours = duration // 3600
        minutes = (duration % 3600) // 60
        create_notification(
            destinataire=user,
            action_type='productive_session',
            module_source='progress',
            message=f"💪 Excellente session ! {hours}h{minutes}min d'apprentissage productif."
        )
    
    # ========= TEMPS QUOTIDIEN =========
    today = timezone.now().date()
    total_today = SessionDuration.objects.filter(
        utilisateur=user,
        date__date=today
    ).aggregate(total=Sum('duration'))['total'] or 0
    
    if total_today >= 14400:  # 4 heures
        create_notification(
            destinataire=user,
            action_type='daily_commitment',
            module_source='progress',
            message="⏳ Engagement impressionnant ! 4+ heures d'étude aujourd'hui."
        )
    
    # ========= SÉRIE DE JOURS =========
    streak = calculate_streak(user)
    
    if streak == 3:
        create_notification(
            destinataire=user,
            action_type='streak_3_days',
            module_source='progress',
            message="🔥 Série de 3 jours ! Vous êtes motivé !"
        )
    elif streak == 7:
        create_notification(
            destinataire=user,
            action_type='streak_7_days',
            module_source='progress',
            message="🌟 Série de 7 jours ! Vous êtes régulier comme une horloge !"
        )
    elif streak == 30:
        create_notification(
            destinataire=user,
            action_type='streak_30_days',
            module_source='progress',
            message="🚀 INCROYABLE ! 30 jours consécutifs ! Vous êtes une machine à apprendre !"
        )

# ============================================================================
# 7. SIGNAL: Progression hebdomadaire
# ============================================================================
@receiver(post_save, sender=ProgressionHistory)
def handle_weekly_progress(sender, instance, created, **kwargs):
    """
    Analyse la progression hebdomadaire et envoie des notifications
    """
    if not created:
        return
    
    user = instance.utilisateur
    
    # ========= PROGRESSION HEBDOMADAIRE =========
    start_of_week = timezone.now() - timedelta(days=7)
    
    # Cours cette semaine
    courses_this_week = ProgressionHistory.objects.filter(
        utilisateur=user,
        created_at__gte=start_of_week,
        type_contenu='cours'
    ).count()
    
    if courses_this_week == 5:
        create_notification(
            destinataire=user,
            action_type='weekly_course_master',
            module_source='progress',
            message="📈 Semaine productive ! Progression sur 5+ cours cette semaine."
        )
    
    # Exercices cette semaine
    exercises_this_week = TentativeExercice.objects.filter(
        utilisateur=user,
        etat='soumis',
        submitted_at__gte=start_of_week
    ).count()
    
    if exercises_this_week >= 10:
        create_notification(
            destinataire=user,
            action_type='weekly_exercise_champion',
            module_source='progress',
            message="💪 Champion des exercices ! 10+ exercices soumis cette semaine."
        )

# ============================================================================
# 8. SIGNAL: Réalisations spéciales
# ============================================================================
def check_special_achievements(user):
    """
    Vérifie et notifie les réalisations spéciales
    """
    # ========= COURS COMPLÉTÉS =========
    completed_courses = ProgressionCours.objects.filter(
        utilisateur=user,
        avancement_cours=100
    ).count()
    
    if completed_courses == 1:
        create_notification(
            destinataire=user,
            action_type='first_course_completed',
            module_source='progress',
            message="🏁 VOTRE PREMIER COURS TERMINÉ ! Un grand pas dans votre apprentissage."
        )
    elif completed_courses == 5:
        create_notification(
            destinataire=user,
            action_type='five_courses_completed',
            module_source='progress',
            message="🎖️ 5 cours terminés ! Vous construisez des compétences solides."
        )
    
    # ========= VARIÉTÉ DE CONTENU =========
    # Nombre de cours différents avec progression
    active_courses = ProgressionCours.objects.filter(
        utilisateur=user,
        avancement_cours__gt=0
    ).count()
    
    if active_courses >= 3:
        create_notification(
            destinataire=user,
            action_type='multi_course_learner',
            module_source='progress',
            message="🌐 Apprenant polyvalent ! Progression sur 3+ cours simultanément."
        )

# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================
def calculate_streak(user):
    """Calcule la série de jours consécutifs avec activité"""
    today = timezone.now().date()
    streak = 0
    
    for i in range(30):
        check_date = today - timedelta(days=i)
        
        has_activity = (
            SessionDuration.objects.filter(
                utilisateur=user,
                date__date=check_date
            ).exists() or
            TentativeExercice.objects.filter(
                utilisateur=user,
                submitted_at__date=check_date
            ).exists() or
            LeconComplete.objects.filter(
                utilisateur=user,
                date__date=check_date
            ).exists()
        )
        
        if has_activity:
            streak += 1
        else:
            break
    
    return streak

def check_consistency(user):
    """Vérifie la régularité d'apprentissage"""
    # Jours avec activité ce mois
    today = timezone.now().date()
    start_of_month = today.replace(day=1)
    
    active_days = set()
    
    # Sessions
    active_days.update(
        SessionDuration.objects.filter(
            utilisateur=user,
            date__date__gte=start_of_month
        ).values_list('date__date', flat=True)
    )
    
    # Leçons complétées
    active_days.update(
        LeconComplete.objects.filter(
            utilisateur=user,
            date__date__gte=start_of_month
        ).values_list('date__date', flat=True)
    )
    
    # Exercices soumis
    active_days.update(
        TentativeExercice.objects.filter(
            utilisateur=user,
            submitted_at__date__gte=start_of_month
        ).values_list('submitted_at__date', flat=True)
    )
    
    active_day_count = len(active_days)
    total_days_in_month = (today - start_of_month).days + 1
    consistency_rate = (active_day_count / total_days_in_month * 100) if total_days_in_month > 0 else 0
    
    if consistency_rate >= 80:
        create_notification(
            destinataire=user,
            action_type='high_consistency',
            module_source='progress',
            message=f"📊 Régularité exceptionnelle ! {consistency_rate:.0f}% de jours actifs ce mois."
        )
    elif consistency_rate >= 50:
        create_notification(
            destinataire=user,
            action_type='good_consistency',
            module_source='progress',
            message=f"📅 Bonne régularité ! {consistency_rate:.0f}% de jours actifs ce mois."
        )

# ============================================================================
# SIGNAL: Vérifications périodiques (à exécuter via tâche cron)
# ============================================================================
def check_periodic_achievements():
    """
    Fonction à appeler périodiquement pour vérifier les réalisations
    """
    from datetime import date
    
    today = date.today()
    
    # Vérifier pour tous les utilisateurs
    for user in Utilisateur.objects.filter(etudiant__isnull=False):
        # Vérifier la série
        streak = calculate_streak(user)
        
        # Vérifier la régularité
        check_consistency(user)
        
        # Vérifier les réalisations spéciales
        check_special_achievements(user)
        
        # Vérifier les objectifs hebdomadaires
        if today.weekday() == 0:  # Lundi
            check_weekly_goals(user)

def check_weekly_goals(user):
    """Vérifie les objectifs hebdomadaires"""
    start_of_week = timezone.now() - timedelta(days=7)
    
    # Leçons cette semaine
    lessons_this_week = LeconComplete.objects.filter(
        utilisateur=user,
        date__gte=start_of_week
    ).count()
    
    if lessons_this_week >= 10:
        create_notification(
            destinataire=user,
            action_type='weekly_lesson_goal',
            module_source='progress',
            message=f"✅ Objectif hebdomadaire atteint ! {lessons_this_week} leçons cette semaine."
        )
    
    # Temps d'étude cette semaine
    study_time_week = SessionDuration.objects.filter(
        utilisateur=user,
        date__gte=start_of_week
    ).aggregate(total=Sum('duration'))['total'] or 0
    
    study_hours = study_time_week // 3600
    
    if study_hours >= 10:
        create_notification(
            destinataire=user,
            action_type='weekly_study_goal',
            module_source='progress',
            message=f"⏰ {study_hours} heures d'étude cette semaine ! Engagement remarquable."
        )
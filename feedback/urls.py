# feedback/urls.py
from django.urls import path
from . import views
from .views import create_or_update_feedback, feedbacks_by_tentative

urlpatterns = [
    path('feedback/', views.FeedbackListCreateView.as_view(), name='feedback-list-create'),
    path('feedback/<int:pk>/', views.FeedbackRetrieveView.as_view(), name='feedback-detail'),
    # REMOVE "api/" from these paths since it's already in the main urls.py
    path("feedback-exercice/", create_or_update_feedback, name="feedback-exercice-create"),
    path("feedback-exercice/list/", feedbacks_by_tentative, name="feedback-exercice-list"),
    path('notifications/', views.user_notifications, name='user_notifications'),
    path('notifications/unread-count/', views.unread_notifications_count, name='unread_notifications_count'),
    path('notifications/<int:notif_id>/read/', views.mark_notification_read, name='mark_notification_read'),
]
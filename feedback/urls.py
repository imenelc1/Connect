# feedback/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ---------- FEEDBACK ----------
    path('feedback/', views.FeedbackListCreateView.as_view(), name='feedback-list-create'),
    path('feedback/<int:pk>/', views.FeedbackRetrieveView.as_view(), name='feedback-detail'),

    path('feedback-exercice/', views.create_or_update_feedback, name='feedback-exercice-create'),
    path('feedback-exercice/list/', views.feedbacks_by_tentative, name='feedback-exercice-list'),

    # ---------- NOTIFICATIONS ----------
    path('notifications/', views.user_notifications, name='user-notifications'),
    path('notifications/unread-count/', views.unread_notifications_count, name='notifications-unread-count'),
    path(
        'notifications/<int:notif_id>/mark-read/',
        views.mark_notification_read,
        name='notification-mark-read'
    ),
]

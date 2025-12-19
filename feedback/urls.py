from django.urls import path
from . import views

urlpatterns = [
    path('feedback/', views.FeedbackListCreateView.as_view(), name='feedback-list-create'),
    path('feedback/<int:pk>/', views.FeedbackRetrieveView.as_view(), name='feedback-detail'),
    path('notifications/', views.user_notifications, name='user_notifications'),
    path('notifications/unread-count/', views.unread_notifications_count, name='unread_notifications_count'),
    path('notifications/<int:notif_id>/read/', views.mark_notification_read, name='mark_notification_read'),
]
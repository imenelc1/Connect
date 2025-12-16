# feedback/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.user_notifications, name='user_notifications'),
    path('notifications/unread-count/', views.unread_notifications_count, name='unread_notifications_count'),
    path('notifications/<int:notif_id>/read/', views.mark_notification_read, name='mark_notification_read'),
]
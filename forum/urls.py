from django.urls import path
from . import views
urlpatterns = [
    # ====== FORUMS ======
    path('forums/', views.list_forums, name='list_forums'),
    path('forums/create/', views.create_forum, name='create_forum'),
    path('forums/<int:forum_id>/delete/', views.delete_forum, name='delete_forum'),

    # ====== LIKES ======
    path('forums/<int:forum_id>/like/', views.like_forum, name='like_forum'),
    path('forums/<int:forum_id>/check-like/', views.check_user_like, name='check_user_like'),

    # ====== MESSAGES ======
    path('forums/<int:forum_id>/messages/', views.forum_messages, name='forum_messages'),
    path('forums/<int:forum_id>/messages/create/', views.create_message, name='create_message'),
    path('messages/<int:message_id>/delete/', views.delete_message, name='delete_message'),

    # ====== COMMENTAIRES ======
    path('messages/<int:message_id>/comments/create/', views.create_comment, name='create_comment'),
    path('comments/<int:comment_id>/delete/', views.delete_comment, name='delete_comment'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('forums/', views.list_forums, name='list_forums'),
path('forums/create/', views.create_forum, name='create_forum'),
path('forums/<int:forum_id>/messages/', views.list_messages, name='list_messages'),
path('forums/<int:forum_id>/messages/create/', views.create_message, name='create_message'),
path('messages/<int:message_id>/comments/create/', views.create_comment, name='create_comment'),
path('forums/<int:forum_id>/like/', views.like_forum, name='like_forum'),

]

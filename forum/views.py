from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Forum, Message, Commentaire, Like
from .serializers import ForumSerializer, MessageSerializer, CommentaireSerializer, LikeSerializer

# Liste tous les forums
@api_view(['GET'])
def list_forums(request):
    forums = Forum.objects.all()
    serializer = ForumSerializer(forums, many=True)
    return Response(serializer.data)

# Créer un forum
@api_view(['POST'])
def create_forum(request):
    serializer = ForumSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)

# Liste tous les messages d’un forum
@api_view(['GET'])
def list_messages(request, forum_id):
    try:
        forum = Forum.objects.get(pk=forum_id)
    except Forum.DoesNotExist:
        return Response({'error': 'Forum not found'}, status=404)
    messages = Message.objects.filter(forum=forum)
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

# Créer un message dans un forum
@api_view(['POST'])
def create_message(request, forum_id):
    try:
        forum = Forum.objects.get(pk=forum_id)
    except Forum.DoesNotExist:
        return Response({'error': 'Forum not found'}, status=404)
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(forum=forum)
        return Response(serializer.data)
    return Response(serializer.errors)

# Créer un commentaire
@api_view(['POST'])
def create_comment(request, message_id):
    try:
        message = Message.objects.get(pk=message_id)
    except Message.DoesNotExist:
        return Response({'error': 'Message not found'}, status=404)
    serializer = CommentaireSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(message=message)
        return Response(serializer.data)
    return Response(serializer.errors)

# Liker un forum
@api_view(['POST'])
def like_forum(request, forum_id):
    try:
        forum = Forum.objects.get(pk=forum_id)
    except Forum.DoesNotExist:
        return Response({'error': 'Forum not found'}, status=404)
    serializer = LikeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(forum=forum)
        return Response(serializer.data)
    return Response(serializer.errors)

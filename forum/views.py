# forum/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Forum, Message, Commentaire, Like
from .serializers import ForumSerializer, MessageSerializer, CommentaireSerializer
from users.jwt_helpers import IsAuthenticatedJWT

# ========== FORUMS ==========
@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def list_forums(request):
    """Liste tous les forums avec statistiques"""
    forums = Forum.objects.all().order_by('-date_creation')
    serializer = ForumSerializer(forums, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def create_forum(request):
    """Crée un nouveau forum"""
    serializer = ForumSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(utilisateur=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticatedJWT])
def delete_forum(request, forum_id):
    """Supprime un forum"""
    try:
        forum = Forum.objects.get(id_forum=forum_id)
    except Forum.DoesNotExist:
        return Response(
            {"error": "Forum introuvable"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier que l'utilisateur est le créateur
    if request.user != forum.utilisateur:
        return Response(
            {"error": "Vous n'êtes pas autorisé à supprimer ce forum"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    forum.delete()
    return Response(
        {"message": "Forum supprimé avec succès"}, 
        status=status.HTTP_200_OK
    )


# ========== LIKES ==========
@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def like_forum(request, forum_id):
    """Like/Unlike un forum"""
    try:
        forum = Forum.objects.get(pk=forum_id)
    except Forum.DoesNotExist:
        return Response(
            {'error': 'Forum introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    like_exists = Like.objects.filter(forum=forum, utilisateur=request.user).exists()
    
    if like_exists:
        Like.objects.filter(forum=forum, utilisateur=request.user).delete()
        action = "unliked"
    else:
        Like.objects.create(forum=forum, utilisateur=request.user)
        action = "liked"
    
    likes_count = Like.objects.filter(forum=forum).count()
    
    return Response({
        'message': f'Forum {action} avec succès',
        'likes_count': likes_count,
        'user_has_liked': not like_exists,
        'action': action
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def check_user_like(request, forum_id):
    """Vérifie si l'utilisateur a liké un forum"""
    try:
        forum = Forum.objects.get(pk=forum_id)
        has_liked = Like.objects.filter(forum=forum, utilisateur=request.user).exists()
        
        return Response({
            'forum_id': forum_id,
            'user_has_liked': has_liked,
            'likes_count': forum.likes.count()  # CORRECTION : Utiliser .count()
        }, status=status.HTTP_200_OK)
    except Forum.DoesNotExist:
        return Response(
            {'error': 'Forum introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# ========== MESSAGES ==========
@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def forum_messages(request, forum_id):
    """Liste tous les messages d'un forum avec leurs commentaires"""
    try:
        forum = Forum.objects.get(pk=forum_id)
    except Forum.DoesNotExist:
        return Response(
            {'error': 'Forum introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    messages = Message.objects.filter(forum=forum).order_by('date_publication')
    serializer = MessageSerializer(messages, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def create_message(request, forum_id):
    """Crée un nouveau message dans un forum"""
    try:
        forum = Forum.objects.get(pk=forum_id)
    except Forum.DoesNotExist:
        return Response(
            {'error': 'Forum introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = MessageSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(forum=forum, utilisateur=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticatedJWT])
def delete_message(request, message_id):
    """Supprime un message"""
    try:
        message = Message.objects.get(pk=message_id)
    except Message.DoesNotExist:
        return Response(
            {'error': 'Message introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier que l'utilisateur est le créateur
    if request.user != message.utilisateur:
        return Response(
            {"error": "Vous n'êtes pas autorisé à supprimer ce message"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    message.delete()
    return Response(
        {"message": "Message supprimé avec succès"}, 
        status=status.HTTP_200_OK
    )


# ========== COMMENTAIRES ==========
@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def create_comment(request, message_id):
    """Crée un commentaire sur un message"""
    try:
        message = Message.objects.get(pk=message_id)
    except Message.DoesNotExist:
        return Response(
            {'error': 'Message introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = CommentaireSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(message=message, utilisateur=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticatedJWT])
def delete_comment(request, comment_id):
    """Supprime un commentaire"""
    try:
        comment = Commentaire.objects.get(pk=comment_id)
    except Commentaire.DoesNotExist:
        return Response(
            {'error': 'Commentaire introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier que l'utilisateur est le créateur
    if request.user != comment.utilisateur:
        return Response(
            {"error": "Vous n'êtes pas autorisé à supprimer ce commentaire"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    comment.delete()
    return Response(
        {"message": "Commentaire supprimé avec succès"}, 
        status=status.HTTP_200_OK
    )
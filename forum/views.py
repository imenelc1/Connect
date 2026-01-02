# forum/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Forum, Message, Commentaire, Like, MessageLike
from .serializers import ForumSerializer, MessageSerializer, CommentaireSerializer
from users.jwt_helpers import IsAuthenticatedJWT
from users.models import Administrateur


# ========== FORUMS ==========
from django.db.models import Q


# forum/views.py - Update the list_forums function

@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def list_forums(request):
    role = getattr(request, "user_role", None)
    user = request.user
    filtre = request.GET.get("filtre", "tous")

    # Start with all forums
    forums = Forum.objects.all()
    
    # Apply role-based filtering
    if role == "admin":
        # Admin sees everything
        pass
    elif role == "etudiant":
        # Student sees:
        # 1. Student forums (student-student, teacher-student)
        # 2. Admin forums for students
        forums = forums.filter(
            Q(type__in=['student-student', 'teacher-student']) |
            Q(type='admin-student-forum', cible='etudiants')
        )
    elif role == "enseignant":
        # Teacher sees:
        # 1. Teacher forums (teacher-teacher, student-teacher)
        # 2. Admin forums for teachers
        forums = forums.filter(
            Q(type__in=['teacher-teacher', 'student-teacher']) |
            Q(type='admin-teacher-forum', cible='enseignants')
        )
    else:
        return Response([], status=200)

    # Optional: apply "my forums" filter
    if filtre == "mes_forums":
        if role == "admin":
            # For admin, show forums they created
            admin_user = Administrateur.objects.filter(email_admin=user.adresse_email).first()
            forums = forums.filter(administrateur=admin_user)
        else:
            # For regular users
            forums = forums.filter(utilisateur=user)

    forums = forums.order_by("-date_creation")
    serializer = ForumSerializer(forums, many=True, context={'request': request})
    return Response(serializer.data)


from users.models import Utilisateur

# forum/views.py - Update the create_forum function for admin

@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def create_forum(request):
    role = getattr(request, "user_role", None)
    data = request.data.copy()
    titre_forum = data.get('titre_forum')
    contenu_forum = data.get('contenu_forum')
    forum_type = data.get('type')
    cible = data.get('cible')

    if not all([titre_forum, contenu_forum]):
        return Response({'error': 'Titre et contenu sont obligatoires'}, status=400)

    # ADMIN CREATION
    if role == "admin":
        admin_user = Administrateur.objects.first()
        if not admin_user:
            return Response({'error': 'Aucun administrateur existant'}, status=404)

        if forum_type not in ['admin-student-forum', 'admin-teacher-forum']:
            if cible == 'etudiants':
                forum_type = 'admin-student-forum'
            elif cible == 'enseignants':
                forum_type = 'admin-teacher-forum'
            else:
                return Response({'error': 'Cible invalide pour admin'}, status=400)

        forum = Forum.objects.create(
            administrateur=admin_user,
            type=forum_type,
            titre_forum=titre_forum,
            contenu_forum=contenu_forum,
            cible=cible
        )

        serializer = ForumSerializer(forum, context={'request': request})
        return Response(serializer.data, status=201)
   
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
    return Response(status=status.HTTP_204_NO_CONTENT)


# Dans forum/views.py
@api_view(['DELETE'])
@permission_classes([IsAuthenticatedJWT])
def admin_delete_forum(request, forum_id):
    """Supprime un forum (pour admin seulement)"""
    # Vérifier que c'est bien un admin
    role = getattr(request, "user_role", None)
    if role != "admin":
        return Response(
            {"error": "Accès réservé aux administrateurs"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        forum = Forum.objects.get(pk=forum_id)
    except Forum.DoesNotExist:
        return Response(
            {"error": "Forum introuvable"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    forum.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticatedJWT])
def admin_update_forum(request, forum_id):
    """Modifie un forum (admin seulement)"""
    # Vérifier que c'est bien un admin
    role = getattr(request, "user_role", None)
    if role != "admin":
        return Response(
            {"error": "Accès réservé aux administrateurs"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        forum = Forum.objects.get(id_forum=forum_id)
    except Forum.DoesNotExist:
        return Response(
            {"error": "Forum introuvable"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Valider les données
    serializer = ForumSerializer(forum, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# ========== LIKES FORUM ==========
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
            'likes_count': forum.likes.count()
        }, status=status.HTTP_200_OK)
    except Forum.DoesNotExist:
        return Response(
            {'error': 'Forum introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# ========== LIKES MESSAGE ==========
@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def like_message(request, message_id):
    """Like/Unlike un message (commentaire)"""
    try:
        message = Message.objects.get(pk=message_id)
    except Message.DoesNotExist:
        return Response(
            {'error': 'Message introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    like_exists = MessageLike.objects.filter(message=message, utilisateur=request.user).exists()
    
    if like_exists:
        MessageLike.objects.filter(message=message, utilisateur=request.user).delete()
        action = "unliked"
    else:
        MessageLike.objects.create(message=message, utilisateur=request.user)
        action = "liked"
    
    likes_count = MessageLike.objects.filter(message=message).count()
    
    return Response({
        'message': f'Message {action} avec succès',
        'likes_count': likes_count,
        'user_has_liked': not like_exists,
        'action': action
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def check_user_message_like(request, message_id):
    """Vérifie si l'utilisateur a liké un message"""
    try:
        message = Message.objects.get(pk=message_id)
        has_liked = MessageLike.objects.filter(message=message, utilisateur=request.user).exists()
        
        return Response({
            'message_id': message_id,
            'user_has_liked': has_liked,
            'likes_count': message.likes.count()
        }, status=status.HTTP_200_OK)
    except Message.DoesNotExist:
        return Response(
            {'error': 'Message introuvable'}, 
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
    try:
        forum = Forum.objects.get(pk=forum_id)
    except Forum.DoesNotExist:
        return Response({'error': 'Forum introuvable'}, status=404)

    user = request.user
    role = getattr(request, "user_role", None)

    # 🔐 Admin → toujours autorisé
    if role == "admin":
        pass

    # 👨‍🎓 Étudiant
    elif role == "etudiant":
        if forum.cible not in ["etudiants", "enseignants"]:
            return Response({'error': 'Accès interdit'}, status=403)

    # 👨‍🏫 Enseignant
    elif role == "enseignant":
        if forum.cible != "enseignants":
            return Response({'error': 'Accès interdit'}, status=403)

    else:
        return Response({'error': 'Rôle invalide'}, status=403)

    serializer = MessageSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(forum=forum, utilisateur=user)
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)


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

from users.models import Utilisateur

def get_destinataires(forum):
    """
    Retourne tous les utilisateurs qui doivent voir ce forum
    """
    if forum.cible == 'etudiants':
        # uniquement ceux qui ont un profil Etudiant
        return Utilisateur.objects.filter(etudiant__isnull=False)
    elif forum.cible == 'enseignants':
        # uniquement ceux qui ont un profil Enseignant
        return Utilisateur.objects.filter(enseignant__isnull=False)
    else:
        return Utilisateur.objects.none()

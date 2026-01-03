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
    user = request.user
    data = request.data.copy()

    titre_forum = data.get('titre_forum')
    contenu_forum = data.get('contenu_forum')
    forum_type = data.get('type', 'general')
    cible = data.get('cible', 'tous')

    if not all([titre_forum, contenu_forum]):
        return Response({'error': 'Titre et contenu sont obligatoires'}, status=400)

    admin_user = None
    utilisateur_user = None

    if role == "admin":
        admin_user = Administrateur.objects.first()
        utilisateur_user = None  # ⚡ important : pas d'utilisateur normal
    else:
        # pour enseignants ou étudiants
        utilisateur_user = user

    forum = Forum.objects.create(
        titre_forum=titre_forum,
        contenu_forum=contenu_forum,
        type=forum_type,
        cible=cible,
        administrateur=admin_user,
        utilisateur=utilisateur_user
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
    """
    GET : Liste tous les messages d'un forum.
    """
    try:
        forum = Forum.objects.get(pk=forum_id)
    except Forum.DoesNotExist:
        return Response({'error': 'Forum introuvable'}, status=404)

    messages = Message.objects.filter(forum=forum).order_by('date_publication')
    serializer = MessageSerializer(messages, many=True, context={'request': request})
    return Response(serializer.data, status=200)

from django.views.decorators.csrf import csrf_exempt
# forum/views.py
from django.shortcuts import get_object_or_404  # ← AJOUTE CET IMPORT

# OU utilise cette approche :
from django.http import Http404

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def create_message(request, forum_id):
    """Crée un message dans un forum - VERSION CORRIGÉE"""
    print("=" * 60)
    print("🆕 CREATE_MESSAGE appelé")
    print(f"🎯 Forum ID: {forum_id}")
    print(f"👤 User: {request.user}")
    print(f"🔑 Role: {getattr(request, 'user_role', 'inconnu')}")
    print(f"📦 Data: {request.data}")
    print("=" * 60)
    
    # OPTION 1: Avec get_object_or_404
    try:
        forum = get_object_or_404(Forum, id_forum=forum_id)
        print(f"✅ Forum trouvé: {forum.titre_forum} (ID: {forum.id_forum})")
    except Http404:
        print(f"❌ Forum {forum_id} non trouvé")
        return Response({'error': 'Forum introuvable'}, status=404)
    
    # OPTION 2: Plus simple sans get_object_or_404
    # try:
    #     forum = Forum.objects.get(id_forum=forum_id)
    #     print(f"✅ Forum trouvé: {forum.titre_forum}")
    # except Forum.DoesNotExist:
    #     print(f"❌ Forum {forum_id} non trouvé")
    #     return Response({'error': 'Forum introuvable'}, status=404)
    
    # Récupère le contenu
    contenu_message = request.data.get('contenu_message')
    print(f"📝 Contenu reçu: {contenu_message}")
    
    if not contenu_message or not str(contenu_message).strip():
        print("❌ Contenu vide ou null")
        return Response({'error': 'Le contenu du message est requis'}, status=400)
    
    # Détermine l'auteur
    role = getattr(request, "user_role", None)
    print(f"👥 Rôle détecté: {role}")
    
    admin_user = None
    utilisateur_user = None
    
    if role == "admin":
        print("👑 Création par admin")
        try:
            admin_user = Administrateur.objects.filter(email_admin=request.user.adresse_email).first()
            print(f"✅ Admin trouvé: {admin_user}")
        except Exception as e:
            print(f"⚠️ Erreur recherche admin: {e}")
            admin_user = None
    else:
        print("👤 Création par utilisateur")
        utilisateur_user = request.user
        print(f"✅ Utilisateur: {utilisateur_user}")
    
    # Crée le message
    try:
        print("🛠️ Création de l'objet Message...")
        message = Message.objects.create(
            forum=forum,
            administrateur=admin_user,
            utilisateur=utilisateur_user,
            contenu_message=str(contenu_message).strip()
        )
        
        print(f"✅ Message créé avec ID: {message.id_message}")
        print(f"✅ Contenu: {message.contenu_message}")
        print(f"✅ Date: {message.date_publication}")
        
        # Sérialise la réponse
        print("🔄 Sérialisation...")
        serializer = MessageSerializer(message, context={'request': request})
        
        print("✅ Sérialisation réussie!")
        print(f"✅ Données renvoyées: {serializer.data}")
        
        return Response(serializer.data, status=201)
        
    except Exception as e:
        print(f"❌ Erreur création message: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Erreur serveur: {str(e)}'}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticatedJWT])
def delete_message(request, message_id):
    try:
        message = Message.objects.get(pk=message_id)
    except Message.DoesNotExist:
        return Response({'error': 'Message introuvable'}, status=404)

    role = getattr(request, "user_role", None)

    # Admin peut supprimer tout
    if role != "admin" and request.user != message.utilisateur:
        return Response(
            {"error": "Vous n'êtes pas autorisé à supprimer ce message"},
            status=status.HTTP_403_FORBIDDEN
        )

    message.delete()
    return Response({"message": "Message supprimé avec succès"}, status=200)


# ========== COMMENTAIRES ==========
@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def create_comment(request, message_id):
    try:
        message = Message.objects.get(pk=message_id)
    except Message.DoesNotExist:
        return Response({'error': 'Message introuvable'}, status=404)

    serializer = CommentaireSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(message=message, utilisateur=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticatedJWT])
def delete_comment(request, comment_id):
    try:
        comment = Commentaire.objects.get(pk=comment_id)
    except Commentaire.DoesNotExist:
        return Response({'error': 'Commentaire introuvable'}, status=404)

    role = getattr(request, "user_role", None)
    if role != "admin" and request.user != comment.utilisateur:
        return Response({"error": "Vous n'êtes pas autorisé à supprimer ce commentaire"}, status=403)

    comment.delete()
    return Response({"message": "Commentaire supprimé avec succès"}, status=200)


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

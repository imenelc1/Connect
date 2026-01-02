# forum/serializers.py
from rest_framework import serializers
from .models import Forum, Message, Commentaire, Like, MessageLike
from users.models import Administrateur

# ===== Commentaire Serializer =====
class CommentaireSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.nom', read_only=True)
    utilisateur_prenom = serializers.CharField(source='utilisateur.prenom', read_only=True)
   
    class Meta:
        model = Commentaire
        fields = [
            'id_commentaire',
            'utilisateur',
            'utilisateur_nom',
            'utilisateur_prenom',
            'message',
            'date_commpub',
            'contenu_comm'
        ]
        read_only_fields = ('utilisateur', 'message', 'date_commpub')


# ===== Forum Serializer =====
class ForumSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.SerializerMethodField()
    utilisateur_prenom = serializers.SerializerMethodField()
    nombre_messages = serializers.SerializerMethodField()
    nombre_likes = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()

    class Meta:
        model = Forum
        fields = [
            'id_forum',
            'utilisateur',
            'administrateur',
            'utilisateur_nom',
            'utilisateur_prenom',
            'type',
            'titre_forum',
            'contenu_forum',
            'cible', 
            'date_creation',
            'nombre_messages',
            'nombre_likes',
            'user_has_liked'
        ]
        read_only_fields = ('utilisateur', 'administrateur', 'date_creation')

    # ===== Méthodes SerializerMethodField =====
    def get_utilisateur_nom(self, obj):
        if obj.administrateur:
            return "Administrateur"
        elif obj.utilisateur:
            return obj.utilisateur.nom
        return None

    def get_utilisateur_prenom(self, obj):
        if obj.administrateur:
            return ""
        elif obj.utilisateur:
            return obj.utilisateur.prenom
        return None

    def get_nombre_messages(self, obj):
        # Assurez-vous que Message.forum a related_name='messages'
        return obj.messages.count() if hasattr(obj, 'messages') else 0

    def get_nombre_likes(self, obj):
        # Assurez-vous que Like.forum a related_name='likes'
        return obj.likes.count() if hasattr(obj, 'likes') else 0

    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(utilisateur=request.user).exists() if hasattr(obj, 'likes') else False
        return False


# ===== Message Serializer =====
class MessageSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.nom', read_only=True)
    utilisateur_prenom = serializers.CharField(source='utilisateur.prenom', read_only=True)
    nombre_commentaires = serializers.SerializerMethodField()
    nombre_likes = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    commentaires = CommentaireSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = [
            'id_message',
            'forum',
            'utilisateur',
            'utilisateur_nom',
            'utilisateur_prenom',
            'contenu_message',
            'date_publication',
            'nombre_commentaires',
            'nombre_likes',
            'user_has_liked',
            'commentaires'
        ]
        read_only_fields = ('forum', 'utilisateur', 'date_publication')

    def get_nombre_commentaires(self, obj):
        return obj.commentaires.count() if hasattr(obj, 'commentaires') else 0

    def get_nombre_likes(self, obj):
        return obj.likes.count() if hasattr(obj, 'likes') else 0

    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(utilisateur=request.user).exists() if hasattr(obj, 'likes') else False
        return False


# ===== Like Serializer =====
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'forum', 'utilisateur', 'date_liker']
        read_only_fields = ('date_liker',)


# ===== MessageLike Serializer =====
class MessageLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageLike
        fields = ['id', 'message', 'utilisateur', 'date_liker']
        read_only_fields = ('date_liker',)

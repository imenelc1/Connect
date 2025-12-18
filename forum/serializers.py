# forum/serializers.py
from rest_framework import serializers
from .models import Forum, Message, Commentaire, Like, MessageLike

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

class ForumSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.nom', read_only=True)
    utilisateur_prenom = serializers.CharField(source='utilisateur.prenom', read_only=True)
    nombre_messages = serializers.SerializerMethodField()
    nombre_likes = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    class Meta:
        model = Forum
        fields = [
            'id_forum',
            'utilisateur',
            'utilisateur_nom',
            'utilisateur_prenom',
            'type',
            'titre_forum',
            'date_creation',
            'nombre_messages',
            'nombre_likes',
            'user_has_liked'
        ]
        read_only_fields = ('utilisateur', 'date_creation')
    def get_nombre_messages(self, obj):
        return obj.messages.count()
   
    def get_nombre_likes(self, obj):
        return obj.likes.count()
   
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(utilisateur=request.user).exists()
        return False

class MessageSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.nom', read_only=True)
    utilisateur_prenom = serializers.CharField(source='utilisateur.prenom', read_only=True)
    nombre_commentaires = serializers.SerializerMethodField()
    nombre_likes = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    commentaires = CommentaireSerializer(many=True, read_only=True)  # Maintenant CommentaireSerializer est défini
   
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
        return obj.commentaires.count()
   
    def get_nombre_likes(self, obj):
        return obj.likes.count()
   
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(utilisateur=request.user).exists()
        return False

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'forum', 'utilisateur', 'date_liker']
        read_only_fields = ('date_liker',)

class MessageLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageLike
        fields = ['id', 'message', 'utilisateur', 'date_liker']
        read_only_fields = ('date_liker',)
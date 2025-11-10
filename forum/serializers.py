from rest_framework import serializers
from .models import Forum, Message, Commentaire, Like
from users.models import Utilisateur

# -------------------
# Serializer Forum
# -------------------
class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = ['id_forum', 'type', 'titre_forum', 'date_creation']

# -------------------
# Serializer Message
# -------------------
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id_message', 'forum', 'utilisateur', 'contenu_message', 'date_publication']

# -------------------
# Serializer Commentaire
# -------------------
class CommentaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commentaire
        fields = ['id', 'utilisateur', 'message', 'date_commpub', 'heure_pub', 'contenu_comm']

# -------------------
# Serializer Like
# -------------------
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'forum', 'utilisateur', 'date_liker']

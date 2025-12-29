from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Notification, Feedback, FeedbackExercice
from users.models import Utilisateur

class FeedbackSerializer(serializers.ModelSerializer):
    afficher_nom = serializers.BooleanField()  # plus write_only
    utilisateur_nom = serializers.SerializerMethodField()
    utilisateur_prenom = serializers.SerializerMethodField()

    content_type_string = serializers.CharField(write_only=True)

    class Meta:
        model = Feedback
        fields = [
            "id_feedback",
            "contenu",
            "etoile",
            "afficher_nom",
            "utilisateur_nom",
            "utilisateur_prenom",
            "content_type_string",
            "object_id",
        ]

    
    def get_utilisateur_nom(self, obj):
        if obj.afficher_nom and obj.utilisateur:
            return obj.utilisateur.nom
        return None

    def get_utilisateur_prenom(self, obj):
        if obj.afficher_nom and obj.utilisateur:
            return obj.utilisateur.prenom
        return None

    def create(self, validated_data):
        request = self.context["request"]
        content_type_string = validated_data.pop("content_type_string")
        app_label, model = content_type_string.split(".")
        validated_data["content_type"] = ContentType.objects.get(
            app_label=app_label,
            model=model
        )
        validated_data["utilisateur"] = request.user
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    # ... (le reste reste identique)
    # Infos utilisateurs
    envoyeur_nom = serializers.CharField(source='utilisateur_envoyeur.nom', read_only=True, allow_null=True)
    envoyeur_prenom = serializers.CharField(source='utilisateur_envoyeur.prenom', read_only=True, allow_null=True)
    
    # Infos sur l'objet lié (forum, cours, etc.)
    content_type_name = serializers.SerializerMethodField()
    object_data = serializers.SerializerMethodField()
    object_id = serializers.SerializerMethodField()
    
    # Pour rétro-compatibilité (si besoin)
    forum_id = serializers.SerializerMethodField()
    message_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id_notif',
            'message_notif',
            'date_envoie',
            'is_read',
            'action_type',
            'module_source',
            'envoyeur_nom',
            'envoyeur_prenom',
            'content_type_name',
            'object_data',
            'object_id',
            'forum_id',
            'message_id',
            'extra_data'
        ]
        read_only_fields = ['date_envoie']
    
    def get_content_type_name(self, obj):
        return obj.content_type.model if obj.content_type else None
    
    def get_object_data(self, obj):
        """Retourne des données spécifiques selon le type d'objet"""
        if not obj.content_object:
            return None
        
        data = {'id': obj.object_id}
        
        # Feedback
        if isinstance(obj.content_object, Feedback):
            data['type'] = 'feedback'
            data['contenu_preview'] = obj.content_object.contenu[:100] if obj.content_object.contenu else ""
            data['etoile'] = obj.content_object.etoile
        
        # Forum
        elif hasattr(obj.content_object, 'titre_forum'):
            data['titre'] = obj.content_object.titre_forum
            data['type'] = 'forum'
        
        # Cours
        elif hasattr(obj.content_object, 'titre'):
            data['titre'] = obj.content_object.titre
            data['type'] = obj.module_source
        
        # Message (dans forum)
        elif hasattr(obj.content_object, 'contenu_message'):
            data['contenu'] = obj.content_object.contenu_message[:100]
            data['type'] = 'message'
            if hasattr(obj.content_object, 'forum'):
                data['forum_id'] = obj.content_object.forum.id_forum
        
        # Exercice
        elif hasattr(obj.content_object, 'enonce'):
            data['enonce'] = obj.content_object.enonce[:100]
            data['type'] = 'exercice'
        
        return data
    
    def get_object_id(self, obj):
        """Pour navigation facile"""
        if obj.content_object and hasattr(obj.content_object, 'pk'):
            return obj.content_object.pk
        return obj.object_id
    
    def get_forum_id(self, obj):
        """Pour compatibilité avec l'ancien code"""
        if obj.module_source == 'forum' and obj.content_object:
            # Si c'est un forum
            if hasattr(obj.content_object, 'id_forum'):
                return obj.content_object.id_forum
            # Si c'est un message dans un forum
            elif hasattr(obj.content_object, 'forum'):
                return obj.content_object.forum.id_forum
        return None
    
    def get_message_id(self, obj):
        """Pour compatibilité avec l'ancien code"""
        if obj.module_source == 'forum' and obj.content_object:
            if hasattr(obj.content_object, 'id_message'):
                return obj.content_object.id_message
        return None

class FeedbackExerciceSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source='auteur.nom', read_only=True)
    auteur_prenom = serializers.CharField(source='auteur.prenom', read_only=True)

    class Meta:
        model = FeedbackExercice
        fields = ['id', 'contenu', 'exercice', 'tentative', 'auteur_nom', 'auteur_prenom', 'date_creation']

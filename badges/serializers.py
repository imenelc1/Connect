from rest_framework import serializers
from .models import Badge, GagnerBadge

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'nom', 'description', 'icone', 'condition', 'categorie', 'numpoints']

class GagnerBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer()  # inclure les infos du badge
    class Meta:
        model = GagnerBadge
        fields = ['id', 'badge', 'date_obtention']

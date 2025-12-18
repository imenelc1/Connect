from badges.models import Badge, GagnerBadge
from courses import serializers


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'nom', 'description', 'icone', 'condition']

class GagnerBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)  # nested serializer pour info du badge

    class Meta:
        model = GagnerBadge
        fields = ['badge', 'date_obtention']

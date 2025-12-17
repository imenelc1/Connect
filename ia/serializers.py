from courses import serializers
from ia.models import Analyse


class AnalyseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analyse
        fields = '__all__'
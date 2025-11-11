from rest_framework import viewsets
from .models import ProgressionCours
from .serializers import ProgressionCoursSerializer
from .models import Badge
from .serializers import BadgeSerializer

class ProgressionCoursViewSet(viewsets.ModelViewSet):
    queryset = ProgressionCours.objects.all()
    serializer_class = ProgressionCoursSerializer
class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
from rest_framework import viewsets
from .models import ProgressionCours
from .serializers import ProgressionCoursSerializer

class ProgressionCoursViewSet(viewsets.ModelViewSet):
    queryset = ProgressionCours.objects.all()
    serializer_class = ProgressionCoursSerializer

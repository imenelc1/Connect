from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, permissions
from users.jwt_helpers import IsAuthenticatedJWT
from .models import Notification, Feedback, FeedbackExercice
from .serializers import NotificationSerializer, FeedbackSerializer, FeedbackExerciceSerializer
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404


# ----- FEEDBACK -----
class FeedbackListCreateView(generics.ListCreateAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        object_id = self.request.query_params.get('object_id')
        content_type_str = self.request.query_params.get('content_type', 'courses.cours')
        
        if object_id:
            try:
                app_label, model = content_type_str.split('.')
                content_type = ContentType.objects.get(app_label=app_label, model=model)
                return Feedback.objects.filter(
                    content_type=content_type,
                    object_id=object_id
                ).select_related('utilisateur').order_by('-date_creation')
            except (ValueError, ContentType.DoesNotExist):
                return Feedback.objects.none()
        return Feedback.objects.none()


    def perform_create(self, serializer):
        serializer.save(utilisateur=self.request.user)


class FeedbackRetrieveView(generics.RetrieveAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticatedJWT]  # MODIFIÉ

# ----- NOTIFICATION -----
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        return Notification.objects.filter(
            utilisateur_destinataire=self.request.user
        ).order_by('-date_envoie')

class NotificationMarkReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedJWT]
    queryset = Notification.objects.all()

    def update(self, request, *args, **kwargs):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        serializer = self.get_serializer(notif)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def user_notifications(request):
    """Récupère toutes les notifications où l'utilisateur est le destinataire"""
    try:
        notifications = Notification.objects.filter(
            utilisateur_destinataire=request.user
        ).order_by('-date_envoie')
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Erreur récupération notifications: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def unread_notifications_count(request):
    """Compte les notifications non lues"""
    try:
        count = Notification.objects.filter(
            utilisateur_destinataire=request.user,
            is_read=False
        ).count()
        
        return Response({"unread_count": count})
    except Exception as e:
        print(f"Erreur comptage notifications: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def mark_notification_read(request, notif_id):
    """Marque une notification comme lue"""
    try:
        notif = Notification.objects.get(
            id_notif=notif_id,
            utilisateur_destinataire=request.user
        )
        notif.is_read = True
        notif.save()
        return Response({"message": "Notification marquée comme lue"})
    except Notification.DoesNotExist:
        return Response(
            {"error": "Notification non trouvée ou accès non autorisé"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class FeedbackExerciceListCreateView(generics.ListCreateAPIView):
    serializer_class = FeedbackExerciceSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        tentative_ids = self.request.query_params.getlist('tentative_ids')
        return FeedbackExercice.objects.filter(tentative_id__in=tentative_ids)

    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)
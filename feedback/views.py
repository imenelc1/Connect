# feedback/views.py (inchangé)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from users.jwt_helpers import IsAuthenticatedJWT
from .models import Notification
from .serializers import NotificationSerializer

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
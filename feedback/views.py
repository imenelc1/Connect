from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, permissions
from users.jwt_helpers import IsAuthenticatedJWT
from .models import Notification, Feedback, FeedbackExercice
from .serializers import NotificationSerializer, FeedbackSerializer, FeedbackExerciceSerializer
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from users.models import Utilisateur, Administrateur


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
# ----- NOTIFICATION -----
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'id_utilisateur'):
            # Récupérer l'objet Utilisateur depuis l'email si nécessaire
            try:
                user = Utilisateur.objects.get(email=user)
            except Utilisateur.DoesNotExist:
                return Notification.objects.none()

        return Notification.objects.filter(
            utilisateur_destinataire=user
        ).order_by('-date_envoie')


class NotificationMarkReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedJWT]
    queryset = Notification.objects.all()

    def update(self, request, *args, **kwargs):
        user = request.user
        if not hasattr(user, 'id_utilisateur'):
            try:
                user = Utilisateur.objects.get(email=user)
            except Utilisateur.DoesNotExist:
                return Response({"error": "Utilisateur introuvable"}, status=404)

        notif = self.get_object()
        # Vérifier que la notification appartient bien à l'utilisateur
        if notif.utilisateur_destinataire != user:
            return Response({"error": "Accès non autorisé"}, status=403)

        notif.is_read = True
        notif.save()
        serializer = self.get_serializer(notif)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def user_notifications(request):
    try:
        obj, role = get_utilisateur_from_request(request)
        if not obj:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_401_UNAUTHORIZED)

        if role == "user":
            notifications = Notification.objects.filter(utilisateur_destinataire=obj).order_by('-date_envoie')
        else:
            notifications = Notification.objects.filter(admin_destinataire=obj).order_by('-date_envoie')

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    except Exception as e:
        print(f"Erreur récupération notifications: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticatedJWT])
def unread_notifications_count(request):
    try:
        obj, role = get_utilisateur_from_request(request)
        if not obj:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_401_UNAUTHORIZED)

        if role == "user":
            count = Notification.objects.filter(utilisateur_destinataire=obj, is_read=False).count()
        else:
            count = Notification.objects.filter(admin_destinataire=obj, is_read=False).count()

        return Response({"unread_count": count})

    except Exception as e:
        print(f"Erreur comptage notifications: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticatedJWT])
def mark_notification_read(request, notif_id):
    try:
        obj, role = get_utilisateur_from_request(request)
        if not obj:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_401_UNAUTHORIZED)

        if role == "user":
            notif = Notification.objects.get(id_notif=notif_id, utilisateur_destinataire=obj)
        else:
            notif = Notification.objects.get(id_notif=notif_id, admin_destinataire=obj)

        notif.is_read = True
        notif.save()
        return Response({"message": "Notification marquée comme lue"})

    except Notification.DoesNotExist:
        return Response({"error": "Notification non trouvée ou accès non autorisé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FeedbackExerciceListCreateView(generics.ListCreateAPIView):
    serializer_class = FeedbackExerciceSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        tentative_ids = self.request.query_params.getlist('tentative_ids')
        return FeedbackExercice.objects.filter(tentative_id__in=tentative_ids)

    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)


def get_utilisateur_from_request(request):
    user = request.user

    # Cas normal : déjà un Utilisateur
    if isinstance(user, Utilisateur):
        return user, "user"

    # Cas JWT custom : email (string)
    try:
        utilisateur = Utilisateur.objects.get(adresse_email=user)
        return utilisateur, "user"
    except Utilisateur.DoesNotExist:
        # Peut-être un admin
        try:
            admin = Administrateur.objects.get(email_admin=user)
            return admin, "admin"
        except Administrateur.DoesNotExist:
            return None, None


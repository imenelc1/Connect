import jwt
from django.conf import settings
from rest_framework import exceptions, permissions, status
from rest_framework.response import Response
from functools import wraps
from .models import Utilisateur


def jwt_authenticate(request):
    """
    Vérifie le token JWT dans le header Authorization.
    Retourne l'utilisateur et le payload si valide.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise exceptions.AuthenticationFailed('Token manquant')

    try:
        token = auth_header.split(' ')[1]  # Bearer <token>
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

        # ✅ GÉRER admin_id ET user_id
        user_id = payload.get("user_id") or payload.get("admin_id")
        if not user_id:
            raise exceptions.AuthenticationFailed("Token invalide (id manquant)")

        user = Utilisateur.objects.get(id_utilisateur=user_id)
        return user, payload

    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed("Token expiré")
    except jwt.DecodeError:
        raise exceptions.AuthenticationFailed("Token invalide")
    except Utilisateur.DoesNotExist:
        raise exceptions.AuthenticationFailed("Utilisateur inexistant")


def jwt_required(view_func):
    """
    Décorateur pour sécuriser une vue avec JWT.
    """
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        try:
            user, payload = jwt_authenticate(request)
            request.user = user
            request.user_role = payload.get("role")
            request.user_id = payload.get("user_id") or payload.get("admin_id")
        except exceptions.AuthenticationFailed as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return view_func(self, request, *args, **kwargs)
    return wrapper


class IsAuthenticatedJWT(permissions.BasePermission):
    """
    Permission DRF pour sécuriser les vues avec JWT.
    """
    def has_permission(self, request, view):
        try:
            user, payload = jwt_authenticate(request)
            request.user = user
            request.user_role = payload.get("role")
            request.user_id = payload.get("user_id") or payload.get("admin_id")
            return True
        except exceptions.AuthenticationFailed:
            return False

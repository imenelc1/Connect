import jwt
from django.conf import settings
from rest_framework import exceptions
from .models import Utilisateur
from rest_framework.response import Response
from rest_framework import status
from functools import wraps
from rest_framework import permissions

def jwt_authenticate(request):
    """
    Vérifie le token JWT dans le header Authorization.
    Retourne l'utilisateur et le payload si valide.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise exceptions.AuthenticationFailed('Token manquant')

    try:
        token = auth_header.split(' ')[1]  # "Bearer <token>"
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user = Utilisateur.objects.get(id_utilisateur=payload['user_id'])
        return user, payload
    except (jwt.ExpiredSignatureError, jwt.DecodeError, Utilisateur.DoesNotExist):
        raise exceptions.AuthenticationFailed('Token invalide')


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
            request.user_id = payload.get("user_id")
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
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
            request.user_id = payload.get("user_id")
            return True
        except exceptions.AuthenticationFailed:
            return False

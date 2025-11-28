from functools import wraps
import jwt
from django.conf import settings
from rest_framework import exceptions, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import Utilisateur

def jwt_authenticate(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise exceptions.AuthenticationFailed('Token manquant')

    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user = Utilisateur.objects.get(id_utilisateur=payload['user_id'])
        return user, payload
    except (jwt.ExpiredSignatureError, jwt.DecodeError, Utilisateur.DoesNotExist):
        raise exceptions.AuthenticationFailed('Token invalide')

def jwt_required(view_func):
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        try:
            user, payload = jwt_authenticate(request)
            request.user = user
            request.user_role = payload.get("role")
            request.user_id = payload.get("user_id")
        except exceptions.AuthenticationFailed as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        return view_func(self, request, *args, **kwargs)
    return wrapper

class IsAuthenticatedJWT(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            user, payload = jwt_authenticate(request)
            request.user = user
            request.user_role = payload.get("role")
            request.user_id = payload.get("user_id")
            return True
        except exceptions.AuthenticationFailed:
            return False

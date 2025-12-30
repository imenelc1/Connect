import jwt
from django.conf import settings
from rest_framework import exceptions, permissions
from .models import Utilisateur, Administrateur

class AdminUserWrapper:
    """Objet factice pour représenter un admin côté DRF."""
    @property
    def is_authenticated(self):
        return True
    role = "admin"

def jwt_authenticate(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise exceptions.AuthenticationFailed("Token manquant")

    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        role = payload.get("role")

        # ----- UTILISATEURS -----
        if role in ["etudiant", "enseignant"]:
            user = Utilisateur.objects.get(id_utilisateur=payload["user_id"])
            # Ne pas assigner is_authenticated, DRF considère l'utilisateur valide s'il existe
            return user, payload

        # ----- ADMIN -----
        if role == "admin":
            admin = Administrateur.objects.get(id_admin=payload["admin_id"])
            # Retourne un objet factice côté DRF
            return AdminUserWrapper(), payload

        raise exceptions.AuthenticationFailed("Rôle invalide")

    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed("Token expiré")
    except jwt.DecodeError:
        raise exceptions.AuthenticationFailed("Token invalide")
    except (Utilisateur.DoesNotExist, Administrateur.DoesNotExist):
        raise exceptions.AuthenticationFailed("Utilisateur introuvable")


class IsAuthenticatedJWT(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            user, payload = jwt_authenticate(request)
            request.user = user
            request.user_role = payload.get("role")
            request.user_id = payload.get("user_id") or payload.get("admin_id")
            return True
        except exceptions.AuthenticationFailed:
            return False
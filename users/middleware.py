import threading
from users.models import Administrateur
from .jwt_auth import jwt_authenticate

class AdminContextMiddleware:
    """
    Middleware pour stocker l'objet admin courant dans le thread.
    Permet aux signaux de savoir si l'action est faite par un admin.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Par défaut, on efface l'admin courant
        threading.current_thread().current_admin = None

        try:
            # On essaie d'authentifier le token JWT
            user, payload = jwt_authenticate(request)
            # Vérifie si c'est un admin
            if payload.get("role") == "admin":
                admin = Administrateur.objects.get(id_admin=payload.get("admin_id"))
                threading.current_thread().current_admin = admin
        except Exception:
            pass  # si pas d'admin ou token invalide, on ignore

        response = self.get_response(request)
        return response
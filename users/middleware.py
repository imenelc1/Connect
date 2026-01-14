# middleware.py
import threading
_admin_local = threading.local()

class AdminContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _admin_local.admin = None
        try:
            user, payload = jwt_authenticate(request)
            if payload.get("role") == "admin":
                _admin_local.admin = Administrateur.objects.get(id_admin=payload.get("admin_id"))
        except:
            pass
        response = self.get_response(request)
        return response

def get_current_admin():
    return getattr(_admin_local, "admin", None)

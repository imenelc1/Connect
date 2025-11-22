from rest_framework import routers
from .views import SpaceViewSet, SpaceEtudiantViewSet, SpaceCourViewSet, SpaceExoViewSet

router = routers.DefaultRouter()
router.register(r'spaces', SpaceViewSet)
router.register(r'space-etudiants', SpaceEtudiantViewSet)
router.register(r'space-cours', SpaceCourViewSet)
router.register(r'space-exos', SpaceExoViewSet)

urlpatterns = router.urls

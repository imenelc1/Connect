from rest_framework.routers import DefaultRouter
from .views import ProgressionCoursViewSet
from .views import BadgeViewSet
from .views import TentativeExerciceViewSet


router = DefaultRouter()
router.register(r'progressions', ProgressionCoursViewSet)
router.register(r'badges', BadgeViewSet)
router.register(r'tentatives', TentativeExerciceViewSet)
urlpatterns = router.urls

from rest_framework.routers import DefaultRouter
from .views import ProgressionCoursViewSet
from .views import BadgeViewSet

router = DefaultRouter()
router.register(r'progressions', ProgressionCoursViewSet)
router.register(r'badges', BadgeViewSet)
urlpatterns = router.urls

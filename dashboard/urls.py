from rest_framework.routers import DefaultRouter
from .views import ProgressionCoursViewSet

router = DefaultRouter()
router.register(r'progressions', ProgressionCoursViewSet)

urlpatterns = router.urls

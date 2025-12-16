from django.db import router
from rest_framework.routers import DefaultRouter

from badges.views import BadgeViewSet

router = DefaultRouter()
router.register(r'badges', BadgeViewSet, basename='badge')
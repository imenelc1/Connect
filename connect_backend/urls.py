from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API apps
    path('api/', include('forum.urls')), 
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/exercices/', include('exercices.urls')),
    path('api/quiz/', include('quiz.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/', include('feedback.urls')),
    path('api/badges/', include('badges.urls')),
    path('api/spaces/', include('spaces.urls')),

    # JWT Token
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Redirection racine vers /api/
    path('', RedirectView.as_view(url='/api/', permanent=True)),
]

# Media en mode debug
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

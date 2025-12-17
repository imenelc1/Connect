from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from spaces.views import my_courses
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('forum.urls')), 
    path('api/', include('feedback.urls')), 
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/exercices/', include('exercices.urls')),
    path('api/quiz/', include('quiz.urls')),
    path('api/dashboard/', include('dashboard.urls')),


    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/spaces/', include('spaces.urls')),

    path('api/my-courses/', my_courses, name='my-courses'), 
    
   

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

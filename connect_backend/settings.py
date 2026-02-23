from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url


BASE_DIR = Path(__file__).resolve().parent.parent


dotenv_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path)

# Vérification
print("Loading .env from:", dotenv_path)
print("SECRET_KEY loaded:", os.getenv("DJANGO_SECRET_KEY"))

SECRET_KEY = "niu+@3uk(v_u&283jn%jb)%0$(!$th@d4xo#2gk)@$b2-+pi-^"
DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = [
    "connectfrontend.netlify.app",    # Juste le nom de domaine
    "connect-1-t976.onrender.com",     # Utilise l'URL exacte de ton log Render
    "localhost",
    "127.0.0.1",
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Apps du projet
    'users',
    'courses.apps.CoursesConfig',
    'exercices.app.ExercicesConfig',
    'quiz.app.QuizConfig',
    'forum.apps.ForumConfig',
    'ia',
    'dashboard',
    'feedback',
    'spaces.apps.SpacesConfig',
    'badges',
    
    # API et CORS
    'rest_framework',
    'corsheaders',
    'django_extensions',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # pour static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'users.middleware.AdminContextMiddleware',
]

# CORS
CORS_ALLOWED_ORIGINS = [
    "https://connectfrontend.netlify.app",  # Remplace par ton URL React front
]
CSRF_TRUSTED_ORIGINS = [
    "https://connectfrontend.netlify.app",
    "https://connect-1-t976.onrender.com", ]
CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization", # Crucial pour envoyer le token Bearer
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

ROOT_URLCONF = 'connect_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'connect_backend.wsgi.application'

# Database PostgreSQL avec Render
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv("DATABASE_URL", "postgres://connectdb_7269_user:h4IWXlGdpMfAZjbBi5MYIsHmMsvYDd24@dpg-d6e3uu24d50c73b7veeg-a.frankfurt-postgres.render.com/connectdb_7269"),
        conn_max_age=600,
        ssl_require=True 
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication', # Indispensable pour le Token
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', # Permet l'accès à register/login par défaut
    ],
}
# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.Utilisateur'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Email 
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
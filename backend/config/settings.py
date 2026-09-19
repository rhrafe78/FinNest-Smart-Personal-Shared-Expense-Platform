"""
Django settings for FINNEST project.
Smart Personal & Shared Expense Management Platform
"""
import os
import sys
from pathlib import Path
from datetime import timedelta
import dj_database_url
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env', override=True)

# Add apps to Python path
sys.path.insert(0, str(BASE_DIR / 'apps'))

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-finnest-saas-enterprise-key-dev-99882233')
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Internal FINNEST apps
    'apps.core',
    'apps.users',
    'apps.personal',
    'apps.budgets',
    'apps.savings',
    'apps.households',
    'apps.settlements',
    'apps.bills',
    'apps.groceries',
    'apps.notifications',
    'apps.analytics',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database Configuration:
# Defaults to SQLite for local development; switches to PostgreSQL seamlessly if DATABASE_URL is set
db_url = os.getenv('DATABASE_URL', '').strip()
if db_url:
    DATABASES = {
        'default': dj_database_url.parse(db_url, conn_max_age=600, conn_health_checks=True)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 6}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudinary optional setup
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', '')
if CLOUDINARY_CLOUD_NAME:
    INSTALLED_APPS.insert(0, 'cloudinary_storage')
    INSTALLED_APPS.append('cloudinary')
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
}

# SimpleJWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS configuration
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True').lower() in ('true', '1', 'yes')
cors_origins_env = os.getenv('CORS_ALLOWED_ORIGINS', '')
if cors_origins_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
    ]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]
CORS_ALLOW_CREDENTIALS = True

# Email Configuration (SMTP / Gmail)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
# Ensure EMAIL_USE_SSL and EMAIL_USE_TLS are strictly mutually exclusive
if EMAIL_PORT == 465:
    EMAIL_USE_SSL = True
    EMAIL_USE_TLS = False
else:
    EMAIL_USE_SSL = False
    EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'thefinnest22@gmail.com').strip()
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'loywilvmcydoioln').strip()
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'FinNest Security <thefinnest22@gmail.com>')
# HTTP Email APIs (Used for Render Free Tier where outbound SMTP ports 25/465/587 are blocked)
BREVO_API_KEY = os.getenv('BREVO_API_KEY', '').strip()
RESEND_API_KEY = os.getenv('RESEND_API_KEY', '').strip()
RESEND_FROM_EMAIL = os.getenv('RESEND_FROM_EMAIL', 'FinNest <onboarding@resend.dev>').strip()


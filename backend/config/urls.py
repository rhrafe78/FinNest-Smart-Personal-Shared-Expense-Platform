"""
URL configuration for FINNEST project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/personal/', include('apps.personal.urls')),
    path('api/v1/budgets/', include('apps.budgets.urls')),
    path('api/v1/savings/', include('apps.savings.urls')),
    path('api/v1/households/', include('apps.households.urls')),
    path('api/v1/settlements/', include('apps.settlements.urls')),
    path('api/v1/bills/', include('apps.bills.urls')),
    path('api/v1/groceries/', include('apps.groceries.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/platform-admin/', include('apps.users.admin_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

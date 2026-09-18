from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SettlementViewSet

router = DefaultRouter()
router.register(r'', SettlementViewSet, basename='settlements')

urlpatterns = [
    path('', include(router.urls)),
]

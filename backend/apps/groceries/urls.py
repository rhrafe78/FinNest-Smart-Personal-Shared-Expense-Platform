from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GroceryListViewSet, GroceryItemViewSet

router = DefaultRouter()
router.register(r'items', GroceryItemViewSet, basename='grocery-items')
router.register(r'', GroceryListViewSet, basename='grocery-lists')

urlpatterns = [
    path('', include(router.urls)),
]

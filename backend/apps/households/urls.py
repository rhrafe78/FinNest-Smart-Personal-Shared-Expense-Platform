from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HouseholdViewSet, HouseholdMemberViewSet, HouseholdExpenseViewSet

router = DefaultRouter()
router.register(r'expenses', HouseholdExpenseViewSet, basename='household-expenses')
router.register(r'members', HouseholdMemberViewSet, basename='household-members')
router.register(r'', HouseholdViewSet, basename='households')

urlpatterns = [
    path('', include(router.urls)),
]

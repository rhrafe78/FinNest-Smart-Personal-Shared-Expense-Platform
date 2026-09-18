from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SavingsGoalViewSet, SavingsContributionViewSet

router = DefaultRouter()
router.register(r'goals', SavingsGoalViewSet, basename='savings-goals')
router.register(r'contributions', SavingsContributionViewSet, basename='savings-contributions')

urlpatterns = [
    path('', include(router.urls)),
]

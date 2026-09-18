from django.urls import path
from .admin_views import (
    AdminStatsView,
    AdminUsersListView,
    AdminUserDetailView,
    AdminHouseholdsListView,
    AdminCategoriesView
)

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('users/', AdminUsersListView.as_view(), name='admin-users-list'),
    path('users/<uuid:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('households/', AdminHouseholdsListView.as_view(), name='admin-households-list'),
    path('categories/', AdminCategoriesView.as_view(), name='admin-categories'),
]

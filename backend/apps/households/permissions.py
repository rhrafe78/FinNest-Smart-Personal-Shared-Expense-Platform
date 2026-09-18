from rest_framework import permissions
from .models import HouseholdMember

class IsHouseholdMember(permissions.BasePermission):
    """Allows access only to members of the household."""
    def has_object_permission(self, request, view, obj):
        household = getattr(obj, 'household', obj)
        return HouseholdMember.objects.filter(household=household, user=request.user).exists()

class IsHouseholdOwnerOrAdmin(permissions.BasePermission):
    """Allows access only to owner or admin members."""
    def has_object_permission(self, request, view, obj):
        household = getattr(obj, 'household', obj)
        return HouseholdMember.objects.filter(
            household=household,
            user=request.user,
            role__in=['owner', 'admin']
        ).exists()

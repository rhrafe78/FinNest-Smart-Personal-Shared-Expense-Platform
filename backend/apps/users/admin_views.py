from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.contrib.auth import get_user_model
from apps.users.models import UserProfile
from apps.households.models import Household, HouseholdExpense
from apps.personal.models import Expense, Income, Category
from apps.users.serializers import UserSerializer

User = get_user_model()

class IsPlatformAdmin(permissions.BasePermission):
    """Allows access only to staff or superuser accounts."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))


class AdminStatsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        total_users = User.objects.count()
        verified_users = User.objects.filter(is_verified=True).count()
        staff_users = User.objects.filter(is_staff=True).count()
        total_households = Household.objects.count()
        
        # Total volumes
        personal_expense_total = Expense.objects.aggregate(total=Sum('amount'))['total'] or 0
        personal_income_total = Income.objects.aggregate(total=Sum('amount'))['total'] or 0
        shared_expense_total = HouseholdExpense.objects.aggregate(total=Sum('amount'))['total'] or 0

        # Recent registrations
        recent_users = User.objects.order_by('-date_joined')[:5]

        return Response({
            'total_users': total_users,
            'verified_users': verified_users,
            'staff_users': staff_users,
            'total_households': total_households,
            'total_transactions_volume': str(personal_expense_total + shared_expense_total),
            'personal_expense_total': str(personal_expense_total),
            'personal_income_total': str(personal_income_total),
            'shared_expense_total': str(shared_expense_total),
            'recent_users': UserSerializer(recent_users, many=True).data,
            'system_status': 'Operational',
        })


class AdminUsersListView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        query = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', 'all')

        users = User.objects.select_related('profile').order_by('-date_joined')

        if query:
            users = users.filter(
                Q(email__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(username__icontains=query)
            )

        if status_filter == 'verified':
            users = users.filter(is_verified=True)
        elif status_filter == 'unverified':
            users = users.filter(is_verified=False)
        elif status_filter == 'staff':
            users = users.filter(is_staff=True)

        data = []
        for u in users:
            data.append({
                'id': str(u.id),
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'full_name': u.get_full_name() or u.username or u.email,
                'is_verified': u.is_verified,
                'is_active': u.is_active,
                'is_staff': u.is_staff,
                'currency': getattr(getattr(u, 'profile', None), 'currency', 'BDT'),
                'date_joined': u.date_joined,
            })

        return Response(data)


class AdminUserDetailView(APIView):
    permission_classes = [IsPlatformAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'is_active' in request.data:
            user.is_active = bool(request.data['is_active'])
        if 'is_verified' in request.data:
            user.is_verified = bool(request.data['is_verified'])
        if 'is_staff' in request.data:
            user.is_staff = bool(request.data['is_staff'])

        user.save()
        return Response({
            'message': 'User updated successfully.',
            'id': str(user.id),
            'email': user.email,
            'is_active': user.is_active,
            'is_verified': user.is_verified,
            'is_staff': user.is_staff,
        })

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user:
            return Response({'detail': 'You cannot delete your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({'message': 'User deleted successfully.'}, status=status.HTTP_200_OK)


class AdminHouseholdsListView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        households = Household.objects.annotate(
            members_count=Count('members', distinct=True),
            total_expenses_count=Count('expenses', distinct=True)
        ).select_related('created_by').order_by('-created_at')

        data = []
        for h in households:
            total_amount = HouseholdExpense.objects.filter(household=h).aggregate(tot=Sum('amount'))['tot'] or 0
            data.append({
                'id': str(h.id),
                'name': h.name,
                'description': h.description,
                'currency': h.currency,
                'invite_code': h.invite_code,
                'owner': {
                    'name': h.created_by.get_full_name() or h.created_by.email,
                    'email': h.created_by.email,
                },
                'members_count': h.members_count,
                'expenses_count': h.total_expenses_count,
                'total_volume': str(total_amount),
                'created_at': h.created_at,
            })

        return Response(data)


class AdminCategoriesView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        categories = Category.objects.filter(is_system=True).order_by('type', 'name')
        data = [{
            'id': str(c.id),
            'name': c.name,
            'type': c.type,
            'icon': c.icon,
            'color': c.color,
            'is_system': c.is_system,
        } for c in categories]
        return Response(data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        cat_type = request.data.get('type', 'expense')
        icon = request.data.get('icon', 'tag')
        color = request.data.get('color', '#6366f1')

        if not name:
            return Response({'detail': 'Category name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        category = Category.objects.create(
            name=name,
            type=cat_type,
            icon=icon,
            color=color,
            is_system=True,
            created_by=request.user
        )
        return Response({
            'id': str(category.id),
            'name': category.name,
            'type': category.type,
            'icon': category.icon,
            'color': category.color,
            'is_system': category.is_system,
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, pk=None):
        cat_id = request.query_params.get('id')
        if not cat_id:
            return Response({'detail': 'Category id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            category = Category.objects.get(pk=cat_id, is_system=True)
            category.delete()
            return Response({'message': 'Category deleted successfully.'})
        except Category.DoesNotExist:
            return Response({'detail': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)

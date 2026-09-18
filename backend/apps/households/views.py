from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404
from apps.core.utils import to_decimal
from apps.settlements.models import Settlement
from .models import Household, HouseholdMember, HouseholdExpense, ExpenseParticipant, HouseholdInvitation
from .serializers import (
    HouseholdSerializer,
    HouseholdMemberSerializer,
    HouseholdExpenseSerializer,
    HouseholdInvitationSerializer
)
from .permissions import IsHouseholdMember, IsHouseholdOwnerOrAdmin

class HouseholdViewSet(viewsets.ModelViewSet):
    serializer_class = HouseholdSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Household.objects.filter(members__user=self.request.user).distinct()

    def perform_create(self, serializer):
        household = serializer.save(created_by=self.request.user)
        HouseholdMember.objects.create(
            household=household,
            user=self.request.user,
            role='owner'
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        household = serializer.save(created_by=request.user)
        HouseholdMember.objects.create(
            household=household,
            user=request.user,
            role='owner'
        )
        household.refresh_from_db()
        return Response(HouseholdSerializer(household, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        household = self.get_object()
        membership = HouseholdMember.objects.filter(household=household, user=request.user).first()
        is_owner = (membership and membership.role == 'owner') or (household.created_by == request.user)
        if not is_owner:
            return Response({'detail': 'শুধুমাত্র মেসের ওনার পুরো মেস মুছে ফেলতে পারবেন।'}, status=status.HTTP_403_FORBIDDEN)
        household.delete()
        return Response({'detail': 'মেস সফলভাবে মুছে ফেলা হয়েছে।'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='join')
    def join_by_code(self, request):
        code = request.data.get('invite_code', '').strip().upper()
        if not code:
            return Response({'detail': 'Invite code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            household = Household.objects.get(invite_code=code)
        except Household.DoesNotExist:
            return Response({'detail': 'Invalid household invite code.'}, status=status.HTTP_404_NOT_FOUND)

        if HouseholdMember.objects.filter(household=household, user=request.user).exists():
            return Response({'detail': 'You are already a member of this household.'}, status=status.HTTP_400_BAD_REQUEST)

        HouseholdMember.objects.create(
            household=household,
            user=request.user,
            role='member'
        )
        return Response(HouseholdSerializer(household, context={'request': request}).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='invite')
    def invite_member(self, request, pk=None):
        household = self.get_object()
        # Verify user has permission to invite
        membership = HouseholdMember.objects.filter(household=household, user=request.user).first()
        if not membership or membership.role not in ['owner', 'admin']:
            return Response({'detail': 'Only owners and admins can invite new members.'}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'detail': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        invite, created = HouseholdInvitation.objects.get_or_create(
            household=household,
            email=email,
            defaults={'invited_by': request.user}
        )
        return Response({
            'message': f'Invitation recorded for {email}',
            'invite_code': household.invite_code,
            'invitation': HouseholdInvitationSerializer(invite).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='add-member')
    def add_member(self, request, pk=None):
        household = self.get_object()
        requester_membership = HouseholdMember.objects.filter(household=household, user=request.user).first()
        if not requester_membership or requester_membership.role not in ['owner', 'admin']:
            return Response({'detail': 'শুধুমাত্র মেসের ওনার বা অ্যাডমিন নতুন মেম্বার যুক্ত করতে পারবেন।'}, status=status.HTTP_403_FORBIDDEN)

        identifier = request.data.get('identifier', '').strip()
        if not identifier:
            return Response({'detail': 'সদস্যের ইমেইল বা ইউজারনেম আবশ্যক।'}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        User = get_user_model()
        target_user = User.objects.filter(Q(email__iexact=identifier) | Q(username__iexact=identifier)).first()
        if not target_user:
            return Response({'detail': f'"{identifier}" নামে কোনো অ্যাকাউন্ট পাওয়া যায়নি। তাকে প্রথমে অ্যাকাউন্ট খুলতে বলুন।'}, status=status.HTTP_404_NOT_FOUND)

        if HouseholdMember.objects.filter(household=household, user=target_user).exists():
            return Response({'detail': f'{target_user.get_full_name() or target_user.username} ইতোমধ্যেই এই মেসের সদস্য।'}, status=status.HTTP_400_BAD_REQUEST)

        new_member = HouseholdMember.objects.create(
            household=household,
            user=target_user,
            role='member'
        )
        return Response(HouseholdMemberSerializer(new_member).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='leave')
    def leave_household(self, request, pk=None):
        household = self.get_object()
        membership = HouseholdMember.objects.filter(household=household, user=request.user).first()
        if not membership:
            return Response({'detail': 'You are not a member of this household.'}, status=status.HTTP_400_BAD_REQUEST)

        if membership.role == 'owner' and household.members.filter(role='owner').count() == 1:
            if household.members.count() > 1:
                return Response(
                    {'detail': 'Please transfer ownership to another member before leaving.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        membership.delete()
        return Response({'message': f'You left {household.name}'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='balances')
    def get_balances(self, request, pk=None):
        """
        Calculates total paid, total owed, settled balances, and net position
        for every member in the household.
        """
        household = self.get_object()
        members = household.members.select_related('user').all()

        balances_data = []
        user_net = Decimal('0.00')

        for m in members:
            u = m.user

            # 1. Total paid by this user for shared expenses
            paid_sum = HouseholdExpense.objects.filter(
                household=household,
                paid_by=u
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            # 2. Total share this user owed for shared expenses
            owed_sum = ExpenseParticipant.objects.filter(
                expense__household=household,
                user=u
            ).aggregate(total=Sum('share_amount'))['total'] or Decimal('0.00')

            # 3. Settlements paid out by this user
            settlements_paid = Settlement.objects.filter(
                household=household,
                payer=u,
                status='settled'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            # 4. Settlements received by this user
            settlements_received = Settlement.objects.filter(
                household=household,
                recipient=u,
                status='settled'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            # Net Balance formula:
            # Net = (Paid for expenses + Settlements Paid) - (Owed share + Settlements Received)
            net = (to_decimal(paid_sum) + to_decimal(settlements_paid)) - (to_decimal(owed_sum) + to_decimal(settlements_received))

            if u == request.user:
                user_net = net

            balances_data.append({
                'membership_id': str(m.id),
                'user_id': str(u.id),
                'username': u.username,
                'full_name': u.get_full_name() or u.username,
                'email': u.email,
                'role': m.role,
                'total_paid': str(to_decimal(paid_sum)),
                'total_owed': str(to_decimal(owed_sum)),
                'settlements_paid': str(to_decimal(settlements_paid)),
                'settlements_received': str(to_decimal(settlements_received)),
                'net_balance': str(to_decimal(net)),
                'status': 'gets_back' if net > Decimal('0.00') else ('owes' if net < Decimal('0.00') else 'settled')
            })

        return Response({
            'household_id': str(household.id),
            'currency': household.currency,
            'current_user_net': str(to_decimal(user_net)),
            'current_user_status': 'gets_back' if user_net > Decimal('0.00') else ('owes' if user_net < Decimal('0.00') else 'settled'),
            'members': balances_data
        })

class HouseholdMemberViewSet(viewsets.ModelViewSet):
    serializer_class = HouseholdMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return HouseholdMember.objects.filter(household__members__user=self.request.user).distinct()

    def destroy(self, request, *args, **kwargs):
        member = self.get_object()
        # Verify requester is owner or admin
        requester_membership = HouseholdMember.objects.filter(
            household=member.household,
            user=request.user
        ).first()

        if not requester_membership or requester_membership.role not in ['owner', 'admin']:
            return Response({'detail': 'Only owners or admins can remove members.'}, status=status.HTTP_403_FORBIDDEN)

        if member.role == 'owner' and requester_membership.role != 'owner':
            return Response({'detail': 'Admins cannot remove the household owner.'}, status=status.HTTP_403_FORBIDDEN)

        member.delete()
        return Response({'message': 'Member removed successfully.'}, status=status.HTTP_204_NO_CONTENT)

class HouseholdExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = HouseholdExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = HouseholdExpense.objects.filter(
            household__members__user=self.request.user
        ).distinct()

        hh_id = self.request.query_params.get('household')
        cat = self.request.query_params.get('category')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        payer_id = self.request.query_params.get('paid_by')

        if hh_id:
            qs = qs.filter(household_id=hh_id)
        if cat:
            qs = qs.filter(category=cat)
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        if payer_id:
            qs = qs.filter(paid_by_id=payer_id)

        return qs

    def perform_create(self, serializer):
        # Default paid_by to current user if not supplied
        paid_by = serializer.validated_data.get('paid_by', self.request.user)
        serializer.save(paid_by=paid_by)

    def update(self, request, *args, **kwargs):
        expense = self.get_object()
        membership = HouseholdMember.objects.filter(household=expense.household, user=request.user).first()
        is_admin = membership and membership.role in ['owner', 'admin']
        if expense.paid_by != request.user and not is_admin:
            return Response(
                {'detail': 'আপনি শুধুমাত্র নিজের যুক্ত করা খরচ এডিট করতে পারবেন। অন্যের খরচে পরিবর্তন করা নিষেধ।'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        expense = self.get_object()
        membership = HouseholdMember.objects.filter(household=expense.household, user=request.user).first()
        is_admin = membership and membership.role in ['owner', 'admin']
        if expense.paid_by != request.user and not is_admin:
            return Response(
                {'detail': 'আপনি শুধুমাত্র নিজের যুক্ত করা খরচ এডিট করতে পারবেন। অন্যের খরচে পরিবর্তন করা নিষেধ।'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        expense = self.get_object()
        membership = HouseholdMember.objects.filter(household=expense.household, user=request.user).first()
        is_admin = membership and membership.role in ['owner', 'admin']
        if expense.paid_by != request.user and not is_admin:
            return Response(
                {'detail': 'আপনি শুধুমাত্র নিজের যুক্ত করা খরচ মুছে ফেলতে পারবেন। অন্যের খরচ ডিলিট করা নিষেধ।'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

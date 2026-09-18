from decimal import Decimal, ROUND_HALF_UP
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.core.utils import to_decimal
from .models import Household, HouseholdMember, HouseholdExpense, ExpenseParticipant, HouseholdInvitation

User = get_user_model()

class UserMiniSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username or obj.email.split('@')[0]

class HouseholdMemberSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = HouseholdMember
        fields = ['id', 'household', 'user', 'user_id', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']

class ExpenseParticipantSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ExpenseParticipant
        fields = ['id', 'user', 'user_id', 'share_amount', 'percentage', 'shares']
        read_only_fields = ['id']

class HouseholdExpenseSerializer(serializers.ModelSerializer):
    paid_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    paid_by_detail = UserMiniSerializer(source='paid_by', read_only=True)
    participants = ExpenseParticipantSerializer(many=True, required=False)

    class Meta:
        model = HouseholdExpense
        fields = [
            'id', 'household', 'title', 'amount', 'category', 'paid_by',
            'paid_by_detail', 'date', 'description', 'receipt',
            'split_method', 'participants', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def create(self, validated_data):
        participants_data = self.initial_data.get('participants', [])
        validated_data.pop('participants', None)
        expense = HouseholdExpense.objects.create(**validated_data)
        self._process_participants(expense, participants_data)
        return expense

    def update(self, instance, validated_data):
        participants_data = self.initial_data.get('participants', None)
        validated_data.pop('participants', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if participants_data is not None:
            instance.participants.all().delete()
            self._process_participants(instance, participants_data)
        return instance

    def _process_participants(self, expense, participants_data):
        total_amount = to_decimal(expense.amount)
        split_method = expense.split_method

        if not participants_data:
            # Default to equal split among all members of the household
            members = expense.household.members.all()
            count = members.count()
            if count == 0:
                return

            base_share = (total_amount / Decimal(str(count))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            running_sum = Decimal('0.00')

            member_list = list(members)
            for idx, member in enumerate(member_list):
                # Ensure the sum matches total_amount exactly down to the last cent
                if idx == len(member_list) - 1:
                    share = total_amount - running_sum
                else:
                    share = base_share
                    running_sum += share

                ExpenseParticipant.objects.create(
                    expense=expense,
                    user=member.user,
                    share_amount=to_decimal(share),
                    percentage=to_decimal(Decimal('100.00') / Decimal(str(count))),
                    shares=Decimal('1.00')
                )
            return

        # Specific custom split logic
        count = len(participants_data)
        if split_method == 'EQUAL':
            base_share = (total_amount / Decimal(str(count))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            running_sum = Decimal('0.00')
            for idx, p in enumerate(participants_data):
                user_id = p.get('user_id') or p.get('user')
                if idx == count - 1:
                    share = total_amount - running_sum
                else:
                    share = base_share
                    running_sum += share

                ExpenseParticipant.objects.create(
                    expense=expense,
                    user_id=user_id,
                    share_amount=to_decimal(share),
                    percentage=to_decimal(Decimal('100.00') / Decimal(str(count))),
                    shares=Decimal('1.00')
                )

        elif split_method == 'EXACT':
            running_sum = Decimal('0.00')
            for p in participants_data:
                user_id = p.get('user_id') or p.get('user')
                share = to_decimal(p.get('share_amount', 0))
                running_sum += share
                ExpenseParticipant.objects.create(
                    expense=expense,
                    user_id=user_id,
                    share_amount=share,
                    percentage=to_decimal((share / total_amount) * Decimal('100.00')) if total_amount > 0 else Decimal('0'),
                    shares=Decimal('1.00')
                )
            # If discrepancy exists due to user input, raise error
            if abs(running_sum - total_amount) > Decimal('0.05'):
                raise serializers.ValidationError(
                    f"Exact split sum ({running_sum}) must equal total expense amount ({total_amount})."
                )

        elif split_method == 'PERCENTAGE':
            total_pct = sum(Decimal(str(p.get('percentage', 0))) for p in participants_data)
            if abs(total_pct - Decimal('100.00')) > Decimal('0.1'):
                raise serializers.ValidationError(f"Percentages must sum to 100%. Current total: {total_pct}%")

            running_sum = Decimal('0.00')
            for idx, p in enumerate(participants_data):
                user_id = p.get('user_id') or p.get('user')
                pct = to_decimal(p.get('percentage', 0))
                if idx == count - 1:
                    share = total_amount - running_sum
                else:
                    share = (total_amount * (pct / Decimal('100.00'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                    running_sum += share

                ExpenseParticipant.objects.create(
                    expense=expense,
                    user_id=user_id,
                    share_amount=to_decimal(share),
                    percentage=pct,
                    shares=Decimal('1.00')
                )

        elif split_method == 'SHARES':
            total_shares = sum(Decimal(str(p.get('shares', 1))) for p in participants_data)
            if total_shares <= Decimal('0'):
                total_shares = Decimal(str(count))

            running_sum = Decimal('0.00')
            for idx, p in enumerate(participants_data):
                user_id = p.get('user_id') or p.get('user')
                user_shares = Decimal(str(p.get('shares', 1)))
                if idx == count - 1:
                    share = total_amount - running_sum
                else:
                    share = (total_amount * (user_shares / total_shares)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                    running_sum += share

                ExpenseParticipant.objects.create(
                    expense=expense,
                    user_id=user_id,
                    share_amount=to_decimal(share),
                    percentage=to_decimal((user_shares / total_shares) * Decimal('100.00')),
                    shares=user_shares
                )

class HouseholdSerializer(serializers.ModelSerializer):
    members = HouseholdMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    current_user_role = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = Household
        fields = [
            'id', 'name', 'description', 'address', 'currency', 'invite_code',
            'created_by', 'member_count', 'current_user_role', 'total_spent',
            'members', 'created_at'
        ]
        read_only_fields = ['id', 'invite_code', 'created_by', 'created_at']

    def get_member_count(self, obj):
        return obj.members.count()

    def get_current_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = obj.members.filter(user=request.user).first()
            return member.role if member else None
        return None

    def get_total_spent(self, obj):
        from django.db.models import Sum
        total = obj.expenses.aggregate(total=Sum('amount'))['total']
        return str(to_decimal(total or Decimal('0.00')))

class HouseholdInvitationSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.ReadOnlyField(source='invited_by.get_full_name')

    class Meta:
        model = HouseholdInvitation
        fields = ['id', 'household', 'email', 'invited_by', 'invited_by_name', 'status', 'created_at']
        read_only_fields = ['id', 'invited_by', 'created_at']

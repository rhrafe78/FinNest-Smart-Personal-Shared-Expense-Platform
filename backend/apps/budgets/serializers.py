from decimal import Decimal
from rest_framework import serializers
from django.db.models import Sum
from apps.personal.models import Expense
from apps.core.utils import to_decimal
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_color = serializers.ReadOnlyField(source='category.color')
    category_icon = serializers.ReadOnlyField(source='category.icon')
    spent_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    usage_percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_name', 'category_color', 'category_icon',
            'name', 'amount', 'start_date', 'end_date', 'alert_threshold',
            'spent_amount', 'remaining_amount', 'usage_percentage', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget limit must be greater than zero.")
        return value

    def validate(self, attrs):
        if attrs.get('start_date') and attrs.get('end_date'):
            if attrs['start_date'] > attrs['end_date']:
                raise serializers.ValidationError("Start date cannot be after end date.")
        return attrs

    def _get_spent(self, obj):
        total = Expense.objects.filter(
            user=obj.user,
            category=obj.category,
            date__gte=obj.start_date,
            date__lte=obj.end_date
        ).aggregate(total=Sum('amount'))['total']
        return to_decimal(total or Decimal('0.00'))

    def get_spent_amount(self, obj):
        return str(self._get_spent(obj))

    def get_remaining_amount(self, obj):
        spent = self._get_spent(obj)
        remaining = obj.amount - spent
        return str(to_decimal(remaining))

    def get_usage_percentage(self, obj):
        spent = self._get_spent(obj)
        if obj.amount > 0:
            pct = (spent / obj.amount) * Decimal('100.0')
            return round(float(pct), 1)
        return 0.0

    def get_status(self, obj):
        spent = self._get_spent(obj)
        pct = (spent / obj.amount) * Decimal('100.0') if obj.amount > 0 else Decimal('0')
        if pct >= Decimal('100.0'):
            return 'exceeded'
        elif pct >= Decimal(str(obj.alert_threshold)):
            return 'warning'
        return 'safe'

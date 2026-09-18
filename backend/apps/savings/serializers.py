import datetime
from decimal import Decimal
from rest_framework import serializers
from apps.core.utils import to_decimal
from .models import SavingsGoal, SavingsContribution

class SavingsContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsContribution
        fields = ['id', 'goal', 'amount', 'date', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Contribution amount must be greater than zero.")
        return value

class SavingsGoalSerializer(serializers.ModelSerializer):
    contributions = SavingsContributionSerializer(many=True, read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    recommended_monthly_saving = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = [
            'id', 'name', 'target_amount', 'current_amount', 'target_date',
            'category', 'description', 'contributions', 'progress_percentage',
            'remaining_amount', 'recommended_monthly_saving', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    def get_progress_percentage(self, obj):
        if obj.target_amount > 0:
            pct = (obj.current_amount / obj.target_amount) * Decimal('100.0')
            return min(round(float(pct), 1), 100.0)
        return 0.0

    def get_remaining_amount(self, obj):
        rem = max(Decimal('0.00'), obj.target_amount - obj.current_amount)
        return str(to_decimal(rem))

    def get_recommended_monthly_saving(self, obj):
        rem = max(Decimal('0.00'), obj.target_amount - obj.current_amount)
        if rem <= Decimal('0.00'):
            return "0.00"

        today = datetime.date.today()
        if obj.target_date <= today:
            return str(to_decimal(rem))

        # Compute remaining months
        days = (obj.target_date - today).days
        months = max(1, round(days / 30.44))
        monthly = rem / Decimal(str(months))
        return str(to_decimal(monthly))

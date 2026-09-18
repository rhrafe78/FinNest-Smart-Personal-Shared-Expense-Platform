from decimal import Decimal
from rest_framework import serializers
from apps.households.serializers import UserMiniSerializer
from .models import Bill

class BillSerializer(serializers.ModelSerializer):
    responsible_person_detail = UserMiniSerializer(source='responsible_person', read_only=True)
    household_name = serializers.ReadOnlyField(source='household.name')
    computed_status = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            'id', 'user', 'household', 'household_name', 'name', 'amount',
            'due_date', 'recurrence', 'responsible_person',
            'responsible_person_detail', 'status', 'computed_status',
            'payment_date', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Bill amount must be greater than zero.")
        return value

    def get_computed_status(self, obj):
        return obj.update_computed_status()

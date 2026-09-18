from decimal import Decimal
from rest_framework import serializers
from apps.core.utils import to_decimal
from apps.households.serializers import UserMiniSerializer
from .models import Settlement

class SettlementSerializer(serializers.ModelSerializer):
    payer_detail = UserMiniSerializer(source='payer', read_only=True)
    recipient_detail = UserMiniSerializer(source='recipient', read_only=True)
    household_name = serializers.ReadOnlyField(source='household.name')

    class Meta:
        model = Settlement
        fields = [
            'id', 'household', 'household_name', 'payer', 'payer_detail',
            'recipient', 'recipient_detail', 'amount', 'date',
            'payment_method', 'status', 'notes', 'proof_image', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Settlement amount must be greater than zero.")
        return value

    def validate(self, attrs):
        payer = attrs.get('payer')
        recipient = attrs.get('recipient')
        if payer and recipient and payer == recipient:
            raise serializers.ValidationError("Payer and recipient cannot be the same person.")
        return attrs

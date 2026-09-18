from decimal import Decimal
from rest_framework import serializers
from apps.households.serializers import UserMiniSerializer
from .models import GroceryList, GroceryItem

class GroceryItemSerializer(serializers.ModelSerializer):
    purchased_by_detail = UserMiniSerializer(source='purchased_by', read_only=True)

    class Meta:
        model = GroceryItem
        fields = [
            'id', 'grocery_list', 'name', 'quantity', 'estimated_price',
            'actual_price', 'is_purchased', 'purchased_by', 'purchased_by_detail', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class GroceryListSerializer(serializers.ModelSerializer):
    items = GroceryItemSerializer(many=True, read_only=True)
    created_by_detail = UserMiniSerializer(source='created_by', read_only=True)
    total_estimated = serializers.SerializerMethodField()
    total_actual = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    completed_items_count = serializers.SerializerMethodField()

    class Meta:
        model = GroceryList
        fields = [
            'id', 'household', 'name', 'is_completed', 'created_by',
            'created_by_detail', 'items', 'total_estimated', 'total_actual',
            'items_count', 'completed_items_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def get_total_estimated(self, obj):
        total = sum((item.estimated_price for item in obj.items.all()), Decimal('0.00'))
        return str(total)

    def get_total_actual(self, obj):
        total = sum((item.actual_price for item in obj.items.all()), Decimal('0.00'))
        return str(total)

    def get_items_count(self, obj):
        return obj.items.count()

    def get_completed_items_count(self, obj):
        return obj.items.filter(is_purchased=True).count()

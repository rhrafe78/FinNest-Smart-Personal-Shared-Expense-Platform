from rest_framework import serializers
from .models import Category, Income, Expense

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'category_type', 'icon', 'color', 'is_system']
        read_only_fields = ['id', 'is_system']

class IncomeSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_color = serializers.ReadOnlyField(source='category.color')
    category_icon = serializers.ReadOnlyField(source='category.icon')

    class Meta:
        model = Income
        fields = [
            'id', 'category', 'category_name', 'category_color', 'category_icon',
            'amount', 'date', 'source', 'notes', 'is_recurring',
            'recurrence_frequency', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Income amount must be greater than zero.")
        return value

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_color = serializers.ReadOnlyField(source='category.color')
    category_icon = serializers.ReadOnlyField(source='category.icon')

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_name', 'category_color', 'category_icon',
            'amount', 'date', 'payment_method', 'merchant', 'notes',
            'receipt', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Expense amount must be greater than zero.")
        return value

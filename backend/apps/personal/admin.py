from django.contrib import admin
from .models import Category, Income, Expense

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category_type', 'is_system', 'user', 'color')
    list_filter = ('category_type', 'is_system')
    search_fields = ('name',)

@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ('source', 'user', 'amount', 'date', 'category', 'is_recurring')
    list_filter = ('date', 'is_recurring')
    search_fields = ('source', 'notes', 'user__email')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('merchant', 'user', 'amount', 'date', 'category', 'payment_method')
    list_filter = ('date', 'payment_method')
    search_fields = ('merchant', 'notes', 'user__email')

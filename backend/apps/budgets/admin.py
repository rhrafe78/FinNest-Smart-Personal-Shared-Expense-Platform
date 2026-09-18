from django.contrib import admin
from .models import Budget

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'amount', 'start_date', 'end_date', 'alert_threshold')
    list_filter = ('category', 'start_date')
    search_fields = ('name', 'user__email')

from django.contrib import admin
from .models import Bill

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'due_date', 'household', 'responsible_person', 'status', 'recurrence')
    list_filter = ('status', 'recurrence', 'due_date')
    search_fields = ('name', 'household__name', 'user__email')

from django.contrib import admin
from .models import Settlement

@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    list_display = ('household', 'payer', 'recipient', 'amount', 'date', 'status', 'payment_method')
    list_filter = ('status', 'payment_method', 'date')
    search_fields = ('household__name', 'payer__email', 'recipient__email')

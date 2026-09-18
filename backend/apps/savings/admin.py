from django.contrib import admin
from .models import SavingsGoal, SavingsContribution

class SavingsContributionInline(admin.TabularInline):
    model = SavingsContribution
    extra = 1

@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    inlines = [SavingsContributionInline]
    list_display = ('name', 'user', 'target_amount', 'current_amount', 'target_date', 'category')
    search_fields = ('name', 'user__email')

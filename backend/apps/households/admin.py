from django.contrib import admin
from .models import Household, HouseholdMember, HouseholdExpense, ExpenseParticipant, HouseholdInvitation

class HouseholdMemberInline(admin.TabularInline):
    model = HouseholdMember
    extra = 1

class ExpenseParticipantInline(admin.TabularInline):
    model = ExpenseParticipant
    extra = 1

@admin.register(Household)
class HouseholdAdmin(admin.ModelAdmin):
    inlines = [HouseholdMemberInline]
    list_display = ('name', 'currency', 'invite_code', 'created_by', 'created_at')
    search_fields = ('name', 'invite_code', 'created_by__email')

@admin.register(HouseholdExpense)
class HouseholdExpenseAdmin(admin.ModelAdmin):
    inlines = [ExpenseParticipantInline]
    list_display = ('title', 'household', 'amount', 'paid_by', 'category', 'date', 'split_method')
    list_filter = ('category', 'split_method', 'date')
    search_fields = ('title', 'household__name', 'paid_by__email')

@admin.register(HouseholdInvitation)
class HouseholdInvitationAdmin(admin.ModelAdmin):
    list_display = ('household', 'email', 'invited_by', 'status', 'created_at')
    list_filter = ('status',)

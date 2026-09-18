import secrets
from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel

class Household(TimeStampedModel):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    currency = models.CharField(max_length=10, default='BDT')
    invite_code = models.CharField(max_length=12, unique=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_households')

    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = secrets.token_hex(4).upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.currency})"

class HouseholdMember(TimeStampedModel):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
    )
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='household_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('household', 'user')
        ordering = ['joined_at']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} in {self.household.name} as {self.role}"

class HouseholdExpense(TimeStampedModel):
    SPLIT_CHOICES = (
        ('EQUAL', 'Equal Split'),
        ('EXACT', 'Exact Amount Split'),
        ('PERCENTAGE', 'Percentage Split'),
        ('SHARES', 'Share-Based Split'),
    )
    CATEGORY_CHOICES = (
        ('Rent', 'Rent'),
        ('Electricity', 'Electricity'),
        ('Gas', 'Gas'),
        ('Water', 'Water'),
        ('Wi-Fi', 'Wi-Fi / Internet'),
        ('Grocery', 'Grocery / Market'),
        ('Cleaning', 'Cleaning & Maid'),
        ('Maintenance', 'Maintenance & Repairs'),
        ('Food', 'Food & Meal'),
        ('Transportation', 'Transportation'),
        ('Other', 'Other Household Cost'),
    )
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Grocery')
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='paid_household_expenses')
    date = models.DateField()
    description = models.TextField(blank=True, default='')
    receipt = models.FileField(upload_to='household_receipts/', null=True, blank=True)
    split_method = models.CharField(max_length=20, choices=SPLIT_CHOICES, default='EQUAL')

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title}: {self.amount} in {self.household.name}"

class ExpenseParticipant(TimeStampedModel):
    expense = models.ForeignKey(HouseholdExpense, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expense_participations')
    share_amount = models.DecimalField(max_digits=14, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    shares = models.DecimalField(max_digits=6, decimal_places=2, default=1.00)

    class Meta:
        unique_together = ('expense', 'user')

    def __str__(self):
        return f"{self.user.username} owes {self.share_amount} for {self.expense.title}"

class HouseholdInvitation(TimeStampedModel):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_invitations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Invite to {self.email} for {self.household.name}"

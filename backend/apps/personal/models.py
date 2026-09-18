from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel

class Category(TimeStampedModel):
    CATEGORY_TYPES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
        ('both', 'Both'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='categories')
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='expense')
    icon = models.CharField(max_length=50, default='Tag')
    color = models.CharField(max_length=20, default='#6366f1')
    is_system = models.BooleanField(default=False)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.name} ({self.category_type})"

class Income(TimeStampedModel):
    FREQUENCY_CHOICES = (
        ('none', 'One-time'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='incomes')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='incomes')
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField()
    source = models.CharField(max_length=150, help_text="e.g. Salary, Freelancing, Dividends")
    notes = models.TextField(blank=True, default='')
    is_recurring = models.BooleanField(default=False)
    recurrence_frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='none')

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"+{self.amount} from {self.source} on {self.date}"

class Expense(TimeStampedModel):
    PAYMENT_METHODS = (
        ('cash', 'Cash'),
        ('bank', 'Bank Transfer'),
        ('card', 'Credit / Debit Card'),
        ('mobile_banking', 'Mobile Banking (bKash/Nagad/UPI)'),
        ('other', 'Other'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField()
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHODS, default='card')
    merchant = models.CharField(max_length=150, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    receipt = models.FileField(upload_to='receipts/', null=True, blank=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"-{self.amount} at {self.merchant or 'Expense'} on {self.date}"

from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel

class SavingsGoal(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='savings_goals')
    name = models.CharField(max_length=120)
    target_amount = models.DecimalField(max_digits=14, decimal_places=2)
    current_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    target_date = models.DateField()
    category = models.CharField(max_length=80, default='General', help_text='Emergency Fund, Gadget, Travel, Vehicle, Education')
    description = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['target_date']

    def __str__(self):
        return f"{self.name} ({self.current_amount}/{self.target_amount})"

class SavingsContribution(TimeStampedModel):
    goal = models.ForeignKey(SavingsGoal, on_delete=models.CASCADE, related_name='contributions')
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField()
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"+{self.amount} to {self.goal.name}"

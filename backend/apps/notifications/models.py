from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel

class Notification(TimeStampedModel):
    TYPE_CHOICES = (
        ('budget_warning', 'Budget Warning'),
        ('budget_exceeded', 'Budget Exceeded'),
        ('bill_due', 'Bill Due Soon'),
        ('bill_overdue', 'Bill Overdue'),
        ('household_invite', 'Household Invitation'),
        ('expense_added', 'Shared Expense Added'),
        ('settlement_request', 'Settlement Request'),
        ('savings_goal', 'Savings Goal Milestone'),
        ('general', 'General Notification'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='general')
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True, default='')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.title} ({'Read' if self.is_read else 'Unread'})"

import datetime
from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.households.models import Household

class Bill(TimeStampedModel):
    RECURRENCE_CHOICES = (
        ('none', 'One-Time'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    )
    STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('due_soon', 'Due Soon'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_bills')
    household = models.ForeignKey(Household, on_delete=models.CASCADE, null=True, blank=True, related_name='bills')
    name = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    due_date = models.DateField()
    recurrence = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, default='monthly')
    responsible_person = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bills'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    payment_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['due_date']

    def update_computed_status(self):
        if self.status == 'paid':
            return 'paid'
        today = datetime.date.today()
        if self.due_date < today:
            self.status = 'overdue'
        elif (self.due_date - today).days <= 3:
            self.status = 'due_soon'
        else:
            self.status = 'upcoming'
        return self.status

    def __str__(self):
        return f"{self.name} ({self.amount}) - {self.status}"

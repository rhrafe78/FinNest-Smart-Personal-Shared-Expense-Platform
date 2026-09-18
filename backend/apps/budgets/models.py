from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.personal.models import Category

class Budget(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    name = models.CharField(max_length=120)
    amount = models.DecimalField(max_digits=14, decimal_places=2, help_text="Budget spending limit")
    start_date = models.DateField()
    end_date = models.DateField()
    alert_threshold = models.PositiveIntegerField(default=80, help_text="Percentage at which warning is triggered")

    class Meta:
        ordering = ['-start_date']
        unique_together = ('user', 'category', 'start_date', 'end_date')

    def __str__(self):
        return f"{self.name} - {self.category.name} ({self.amount})"

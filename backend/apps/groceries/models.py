from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.households.models import Household

class GroceryList(TimeStampedModel):
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='grocery_lists')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_grocery_lists')
    name = models.CharField(max_length=150, default='Weekly Grocery')
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.household.name}"

class GroceryItem(TimeStampedModel):
    grocery_list = models.ForeignKey(GroceryList, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=150)
    quantity = models.CharField(max_length=50, blank=True, default='1 unit', help_text="e.g. 5 kg, 2 liters, 1 dozen")
    estimated_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    actual_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    is_purchased = models.BooleanField(default=False)
    purchased_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchased_groceries')

    class Meta:
        ordering = ['is_purchased', 'name']

    def __str__(self):
        return f"{self.name} ({self.quantity}) - {'Purchased' if self.is_purchased else 'Pending'}"

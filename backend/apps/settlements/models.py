from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.households.models import Household

class Settlement(TimeStampedModel):
    STATUS_CHOICES = (
        ('pending', 'Pending Confirmation'),
        ('settled', 'Settled / Completed'),
    )
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='settlements')
    payer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='settlements_sent')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='settlements_received')
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField()
    payment_method = models.CharField(max_length=60, default='Cash', help_text="Cash, bKash, Nagad, Bank, etc.")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='settled')
    notes = models.TextField(blank=True, default='')
    proof_image = models.FileField(upload_to='settlement_proofs/', null=True, blank=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.payer.username} -> {self.recipient.username}: {self.amount} ({self.status})"

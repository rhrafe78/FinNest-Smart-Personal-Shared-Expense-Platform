import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.core.models import TimeStampedModel

class User(AbstractUser):
    """Custom user model with UUID as primary key and email uniqueness."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        ordering = ['date_joined']

    def __str__(self):
        return self.get_full_name() or self.username or self.email

class UserProfile(TimeStampedModel):
    """Profile storing currency, country, financial preferences and avatar."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=30, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    currency = models.CharField(max_length=10, default='BDT')
    country = models.CharField(max_length=60, default='Bangladesh')
    timezone = models.CharField(max_length=60, default='Asia/Dhaka')
    monthly_income = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    financial_preferences = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.email} Profile"

class EmailOTP(TimeStampedModel):
    """Stores real database-backed OTP codes with expiration and rate-limiting."""
    PURPOSE_CHOICES = (
        ('register', 'Registration Verification'),
        ('login', 'Passwordless OTP Login'),
        ('reset_password', 'Password Reset'),
    )
    email = models.EmailField(db_index=True)
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES, default='register')
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.email} ({self.purpose}) - {'Used' if self.is_used else 'Active'}"

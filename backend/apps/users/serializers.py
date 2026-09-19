from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile
from .otp_service import OTPService

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'id', 'phone', 'avatar', 'currency', 'country',
            'timezone', 'monthly_income', 'financial_preferences', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_verified', 'is_staff', 'is_superuser', 'profile', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username or obj.email.split('@')[0]

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    currency = serializers.CharField(write_only=True, default='BDT', required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password', 'currency']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if not attrs.get('username'):
            base_username = attrs.get('email', '').split('@')[0]
            candidate = base_username
            counter = 1
            while User.objects.filter(username=candidate).exists():
                candidate = f"{base_username}{counter}"
                counter += 1
            attrs['username'] = candidate
        return attrs

    def create(self, validated_data):
        currency = validated_data.pop('currency', 'BDT')
        password = validated_data.pop('password')
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email'].split('@')[0]

        # In real account workflow, create with is_verified=False pending OTP
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.is_verified = False
        user.save()

        # Update profile currency
        if hasattr(user, 'profile'):
            user.profile.currency = currency
            user.profile.save()

        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    purpose = serializers.ChoiceField(
        choices=['register', 'login', 'reset_password'],
        default='register'
    )

    def validate_email(self, value):
        return value.strip().lower()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, min_length=6, max_length=6)
    purpose = serializers.ChoiceField(
        choices=['register', 'login', 'reset_password'],
        default='register'
    )

    def validate_email(self, value):
        return value.strip().lower()

    def validate_otp_code(self, value):
        return str(value).strip()


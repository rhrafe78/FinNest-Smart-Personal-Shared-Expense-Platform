from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, UserProfile
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
    validate_password_strength
)
from .otp_service import OTPService

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        # If user exists but is not verified yet, update their info and re-issue OTP
        existing_user = User.objects.filter(email__iexact=email).first() if email else None
        if existing_user and not existing_user.is_verified:
            if request.data.get('password'):
                try:
                    validate_password_strength(request.data['password'])
                except Exception as e:
                    return Response({'password': [str(e.detail[0] if hasattr(e, 'detail') else e)]}, status=status.HTTP_400_BAD_REQUEST)
                existing_user.set_password(request.data['password'])
            existing_user.first_name = request.data.get('first_name', existing_user.first_name)
            existing_user.last_name = request.data.get('last_name', existing_user.last_name)
            existing_user.save()
            user = existing_user
            otp_info = OTPService.generate_and_send_otp(user.email, purpose='register')
            return Response({
                'user': UserSerializer(user).data,
                'email': user.email,
                'is_verified': False,
                'email_sent': otp_info.get('email_sent', False),
                'message': f'A 6-digit verification code has been sent to your Gmail ({user.email}).'
            }, status=status.HTTP_201_CREATED)

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp_info = OTPService.generate_and_send_otp(user.email, purpose='register')
            resp = {
                'user': UserSerializer(user).data,
                'email': user.email,
                'is_verified': False,
                'email_sent': otp_info.get('email_sent', False),
                'message': f'A 6-digit verification code has been sent to your Gmail ({user.email}).'
            }
            return Response(resp, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendOTPView(APIView):
    """Generates and sends real OTP to user email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            purpose = serializer.validated_data['purpose']

            # If purpose is login, verify user exists first
            if purpose == 'login' and not User.objects.filter(email__iexact=email).exists():
                return Response(
                    {'detail': 'No registered account found with this email address.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            res = OTPService.generate_and_send_otp(email, purpose=purpose)
            resp = {
                'message': f'A 6-digit verification code has been sent to your Gmail ({email}).',
                'email': email,
                'purpose': purpose,
                'email_sent': res.get('email_sent', False),
                'email_error': res.get('email_error'),
            }
            return Response(resp, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    """
    Validates real OTP from database.
    If register: activates account (is_verified=True) and issues JWT tokens.
    If login: logs user in and issues JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']
            purpose = serializer.validated_data['purpose']

            is_valid, msg = OTPService.verify_otp(email, otp_code, purpose=purpose)
            if not is_valid:
                return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)

            # Verification succeeded!
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                return Response({'detail': 'No registered account found matching this email. Please complete registration first.'}, status=status.HTTP_404_NOT_FOUND)


            # Activate account
            if not user.is_verified:
                user.is_verified = True
                user.save()

            # Issue JWT tokens for seamless automated sign-in
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'OTP verification successful! Welcome to FinNest.',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate by email
        user = None
        try:
            target_user = User.objects.get(email__iexact=email)
            if target_user.check_password(password):
                user = target_user
        except User.DoesNotExist:
            user = None

        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'detail': 'This account has been disabled.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_verified:
            user.is_verified = True
            user.save(update_fields=['is_verified'])

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        })

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        user.save()

        # Update profile
        profile = user.profile
        if 'phone' in request.data:
            profile.phone = request.data['phone']
        if 'currency' in request.data:
            profile.currency = request.data['currency']
        if 'country' in request.data:
            profile.country = request.data['country']
        if 'timezone' in request.data:
            profile.timezone = request.data['timezone']
        if 'monthly_income' in request.data:
            profile.monthly_income = request.data['monthly_income']
            
        prefs = dict(profile.financial_preferences or {})
        if 'daily_target' in request.data:
            prefs['daily_target'] = str(request.data['daily_target'])
        if 'financial_preferences' in request.data and isinstance(request.data['financial_preferences'], dict):
            prefs.update(request.data['financial_preferences'])
        profile.financial_preferences = prefs

        if 'avatar' in request.FILES:
            profile.avatar = request.FILES['avatar']

        profile.save()

        return Response(UserSerializer(user).data)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'old_password': ['Wrong password.']}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password updated successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DemoUsersListView(APIView):
    """Allows demo reviewers to quickly switch or view demo accounts."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        demo_emails = ['rafi@finnest.com', 'rahim@finnest.com', 'karim@finnest.com', 'hasan@finnest.com']
        users = User.objects.filter(email__in=demo_emails)
        return Response({
            'demo_users': [
                {
                    'id': str(u.id),
                    'email': u.email,
                    'name': u.get_full_name(),
                    'role_in_demo': 'Household Owner' if 'rafi' in u.email else 'Household Member',
                    'default_password': 'password123'
                }
                for u in users
            ]
        })

import secrets
import threading
import smtplib
from datetime import timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate
from django.utils import timezone
from django.conf import settings
from .models import EmailOTP


def _dispatch_otp_email(email: str, code: str, purpose: str, recipient_name: str, purpose_text: str):
    """
    Background worker that dispatches OTP email with maximum deliverability.
    - No forged Message-ID (lets Google generate authentic DKIM-signed Message-ID)
    - Standard RFC 3834 auto-generated headers
    - Fast Port 465 SSL with Port 587 STARTTLS dual fallback
    """
    host_user = getattr(settings, 'EMAIL_HOST_USER', 'thefinnest22@gmail.com').strip()
    host_pwd = getattr(settings, 'EMAIL_HOST_PASSWORD', 'loywilvmcydoioln').strip()

    if not host_user or not host_pwd:
        print(f"[OTP EMAIL ERROR] Missing SMTP credentials.")
        return False

    from_email = f"FinNest Security <{host_user}>"
    subject = f"{code} is your FinNest verification code"

    plain_message = (
        f"Hello {recipient_name},\n\n"
        f"Your one-time verification code is: {code}\n\n"
        f"Use this code to {purpose_text}. This code will expire in 10 minutes.\n\n"
        f"If you did not request this verification code, please ignore this email.\n\n"
        f"— FinNest Security Team\n"
    )

    html_message = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{code} is your verification code</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="max-width: 460px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); text-align: left;">
          
          <!-- FinNest Brand Header -->
          <div style="margin-bottom: 20px;">
            <span style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Fin<span style="color: #6366f1;">Nest</span></span>
          </div>

          <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
            Hi {recipient_name},
          </h3>

          <p style="font-size: 15px; line-height: 1.5; color: #475569; margin: 0 0 18px 0;">
            Here is your one-time verification code to {purpose_text}:
          </p>

          <!-- OTP Box with nowrap and letter spacing for mobile -->
          <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px 12px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e1b4b; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; display: inline-block; white-space: nowrap;">
              {code}
            </span>
          </div>

          <p style="font-size: 13px; color: #64748b; margin: 16px 0 0 0; line-height: 1.5;">
            ⏱️ This code will expire in <strong>10 minutes</strong>. For your security, never share this code with anyone.
          </p>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />

          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
            If you did not request this code, no action is needed.<br>
            FinNest App &bull; Smart Expense &amp; Mess Management
          </p>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = email
    msg['Reply-To'] = host_user
    msg['Date'] = formatdate(localtime=True)

    msg.attach(MIMEText(plain_message, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_message, 'html', 'utf-8'))
    raw_msg = msg.as_string()

    # Step 1: Attempt Port 465 Direct SSL
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=8)
        server.login(host_user, host_pwd)
        server.sendmail(host_user, [email], raw_msg)
        try:
            server.quit()
        except Exception:
            pass
        print(f"[OTP EMAIL SUCCESS - Port 465 SSL] To: {email} | Code: {code}")
        return True
    except Exception as err_ssl:
        print(f"[OTP EMAIL 465 SSL Warning] {err_ssl} -> Trying Port 587 STARTTLS fallback...")

    # Step 2: Fallback to Port 587 STARTTLS
    try:
        server587 = smtplib.SMTP('smtp.gmail.com', 587, timeout=8)
        server587.ehlo()
        server587.starttls()
        server587.ehlo()
        server587.login(host_user, host_pwd)
        server587.sendmail(host_user, [email], raw_msg)
        try:
            server587.quit()
        except Exception:
            pass
        print(f"[OTP EMAIL SUCCESS - Port 587 STARTTLS] To: {email} | Code: {code}")
        return True
    except Exception as err_tls:
        print(f"[OTP EMAIL CRITICAL FAILURE] Both Port 465 and Port 587 failed: SSL: {err_ssl} | TLS: {err_tls}")
        return False


class OTPService:
    EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 5

    @classmethod
    def generate_and_send_otp(cls, email: str, purpose: str = 'register'):
        """
        Generates or reuses a 6-digit numeric OTP, stores it in the database,
        and dispatches it directly to the user's email address.
        """
        email = email.strip().lower()

        # Check if there is an active, unexpired OTP requested in the last 90 seconds
        recent_threshold = timezone.now() - timedelta(seconds=90)
        existing_active_otp = EmailOTP.objects.filter(
            email=email,
            purpose=purpose,
            is_used=False,
            created_at__gte=recent_threshold,
            expires_at__gt=timezone.now()
        ).order_by('-created_at').first()

        if existing_active_otp:
            # Reuse the same code so that whatever email arrives in their inbox is valid!
            code = existing_active_otp.otp_code
        else:
            # Generate brand new cryptographically secure 6-digit numeric OTP
            code = f"{secrets.randbelow(900000) + 100000:06d}"
            expires_at = timezone.now() + timedelta(minutes=cls.EXPIRY_MINUTES)
            EmailOTP.objects.create(
                email=email,
                otp_code=code,
                purpose=purpose,
                expires_at=expires_at,
                is_used=False,
                attempts=0
            )

        recipient_name = email.split('@')[0].capitalize()
        purpose_labels = {
            'register': 'activate your FinNest account',
            'login': 'sign in to your FinNest account',
            'reset_password': 'reset your account password',
        }
        purpose_text = purpose_labels.get(purpose, 'confirm your request')

        # Direct synchronous dispatch guarantees Google accepts the message
        email_sent = _dispatch_otp_email(email, code, purpose, recipient_name, purpose_text)

        # Terminal feedback
        print(f"\n==========================================")
        print(f"[FINNEST REAL OTP DISPATCH]")
        print(f"To: {email}")
        print(f"Purpose: {purpose}")
        print(f"Code: {code} (Expires in {cls.EXPIRY_MINUTES}m)")
        print(f"Delivery: {'SUCCESS' if email_sent else 'FAILED'}")
        print(f"==========================================\n")

        res_data = {
            'email': email,
            'purpose': purpose,
            'expires_in_minutes': cls.EXPIRY_MINUTES,
            'email_sent': email_sent,
            'email_error': None if email_sent else 'Failed to send verification email via Gmail SMTP',
        }
        if getattr(settings, 'DEBUG', False):
            res_data['debug_otp'] = code

        return res_data

    @classmethod
    def verify_otp(cls, email: str, otp_code: str, purpose: str = 'register'):
        """
        Validates the OTP code against database records.
        Returns (is_valid: bool, message: str)
        """
        email = email.strip().lower()
        otp_code = str(otp_code).strip()

        # 1. First look for matching active unexpired code for this email and exact purpose
        matching_record = EmailOTP.objects.filter(
            email=email,
            purpose=purpose,
            otp_code=otp_code,
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()

        # If not found with exact purpose, check any active unexpired OTP for this email
        if not matching_record:
            matching_record = EmailOTP.objects.filter(
                email=email,
                otp_code=otp_code,
                is_used=False,
                expires_at__gt=timezone.now()
            ).first()

        if matching_record:
            # Check attempts limit
            if matching_record.attempts >= cls.MAX_ATTEMPTS:
                matching_record.is_used = True
                matching_record.save()
                return False, "Too many failed attempts. This code has been invalidated. Please request a new one."

            # Successfully verified! Mark this code used and invalidate all older codes for this email
            matching_record.is_used = True
            matching_record.save()
            EmailOTP.objects.filter(email=email, is_used=False).update(is_used=True)
            return True, "Verification successful."

        # 2. If no matching code found, find the latest active OTP for this email to track attempts
        latest_active = EmailOTP.objects.filter(
            email=email,
            is_used=False
        ).order_by('-created_at').first()

        if not latest_active:
            return False, "No active verification code found. Please request a new OTP."

        if timezone.now() > latest_active.expires_at:
            latest_active.is_used = True
            latest_active.save()
            return False, "Verification code has expired. Please request a new OTP."

        if latest_active.attempts >= cls.MAX_ATTEMPTS:
            latest_active.is_used = True
            latest_active.save()
            return False, "Too many failed attempts. Please request a new OTP."

        # Increment failed attempts on the active record
        latest_active.attempts += 1
        latest_active.save()
        remaining = cls.MAX_ATTEMPTS - latest_active.attempts
        if remaining <= 0:
            latest_active.is_used = True
            latest_active.save()
            return False, "Too many incorrect attempts. This code has been invalidated. Please request a new OTP."

        return False, f"Incorrect verification code. {remaining} attempt(s) remaining."

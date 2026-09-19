import os
import json
import urllib.request
import secrets
import threading
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from .models import EmailOTP


class OTPService:
    EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 5

    @classmethod
    def generate_and_send_otp(cls, email: str, purpose: str = 'register'):
        """
        Generates a 6-digit numeric OTP, stores it in the database,
        and sends it asynchronously to the user's email address.
        """
        email = email.strip().lower()

        # Invalidate existing unused OTPs for this email and purpose
        EmailOTP.objects.filter(
            email=email,
            purpose=purpose,
            is_used=False
        ).update(is_used=True)

        # Generate cryptographically secure 6-digit number between 100000 and 999999
        code = str(secrets.randbelow(900000) + 100000)
        expires_at = timezone.now() + timedelta(minutes=cls.EXPIRY_MINUTES)

        otp_record = EmailOTP.objects.create(
            email=email,
            otp_code=code,
            purpose=purpose,
            expires_at=expires_at,
            is_used=False,
            attempts=0
        )

        # Deliverability: High reputation display name matching Gmail account
        sender_email = getattr(settings, 'EMAIL_HOST_USER', 'thefinnest22@gmail.com').strip()
        from_email = f"FinNest <{sender_email}>"

        # Standard OTP subject pattern trusted by Google/Gmail algorithms for Primary Inbox
        subject = f"{code} is your FinNest verification code"
        recipient_name = email.split('@')[0].capitalize()

        purpose_labels = {
            'register': 'activate your FinNest account',
            'login': 'sign in to your FinNest account',
            'reset_password': 'reset your account password',
        }
        purpose_text = purpose_labels.get(purpose, 'confirm your request')

        plain_message = (
            f"Hello {recipient_name},\n\n"
            f"Your one-time verification code is: {code}\n\n"
            f"Use this code to {purpose_text}. This code will expire in {cls.EXPIRY_MINUTES} minutes.\n\n"
            f"If you did not request this verification code, please ignore this email.\n\n"
            f"— FinNest Security Team\n"
        )

        # High-deliverability clean card template with FinNest logo badge
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
            ⏱️ This code will expire in <strong>{cls.EXPIRY_MINUTES} minutes</strong>. For your security, never share this code with anyone.
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

        email_sent = False
        email_error = None

        # 1. Check Brevo HTTP API (Port 443 HTTPS - recommended for Render Free Tier)
        brevo_key = os.getenv('BREVO_API_KEY', getattr(settings, 'BREVO_API_KEY', '')).strip()
        if brevo_key:
            try:
                payload = {
                    "sender": {"name": "FinNest Security", "email": sender_email},
                    "to": [{"email": email, "name": recipient_name}],
                    "subject": subject,
                    "htmlContent": html_message,
                    "textContent": plain_message
                }
                req = urllib.request.Request(
                    "https://api.brevo.com/v3/smtp/email",
                    data=json.dumps(payload).encode('utf-8'),
                    headers={
                        "api-key": brevo_key,
                        "Content-Type": "application/json",
                        "accept": "application/json"
                    },
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=8) as resp:
                    if resp.status in (200, 201):
                        email_sent = True
                        print(f"[BREVO HTTP API EMAIL SUCCESS] To: {email} | Code: {code}")
            except Exception as e_brevo:
                print(f"[BREVO HTTP API ERROR] {e_brevo}")
                email_error = f"Brevo error: {e_brevo}"

        # 2. Check Resend HTTP API (Port 443 HTTPS - recommended for Render Free Tier)
        if not email_sent:
            resend_key = os.getenv('RESEND_API_KEY', getattr(settings, 'RESEND_API_KEY', '')).strip()
            if resend_key:
                resend_from = os.getenv('RESEND_FROM_EMAIL', getattr(settings, 'RESEND_FROM_EMAIL', 'FinNest <onboarding@resend.dev>')).strip()
                try:
                    payload = {
                        "from": resend_from,
                        "to": [email],
                        "subject": subject,
                        "html": html_message,
                        "text": plain_message
                    }
                    req = urllib.request.Request(
                        "https://api.resend.com/emails",
                        data=json.dumps(payload).encode('utf-8'),
                        headers={
                            "Authorization": f"Bearer {resend_key}",
                            "Content-Type": "application/json"
                        },
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=8) as resp:
                        if resp.status in (200, 201):
                            email_sent = True
                            print(f"[RESEND HTTP API EMAIL SUCCESS] To: {email} | Code: {code}")
                except Exception as e_resend:
                    print(f"[RESEND HTTP API ERROR] {e_resend}")
                    email_error = f"Resend error: {e_resend}"

        # 3. Direct Gmail SMTP SSL (Port 465 - works on Localhost & servers with open SMTP)
        has_smtp_credentials = bool(
            getattr(settings, 'EMAIL_HOST_USER', None) and 
            getattr(settings, 'EMAIL_HOST_PASSWORD', None) and
            str(settings.EMAIL_HOST_USER).strip() and
            str(settings.EMAIL_HOST_PASSWORD).strip()
        )

        if not email_sent and has_smtp_credentials:
            try:
                import smtplib
                from email.mime.multipart import MIMEMultipart
                from email.mime.text import MIMEText
                from email.utils import formatdate, make_msgid

                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = from_email
                msg['To'] = email
                msg['Reply-To'] = sender_email
                msg['Date'] = formatdate(localtime=True)
                msg['Message-ID'] = make_msgid(domain='gmail.com')

                msg.attach(MIMEText(plain_message, 'plain', 'utf-8'))
                msg.attach(MIMEText(html_message, 'html', 'utf-8'))

                host_user = str(settings.EMAIL_HOST_USER).strip()
                host_pwd = str(settings.EMAIL_HOST_PASSWORD).strip()

                server = smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=4)
                server.login(host_user, host_pwd)
                server.sendmail(host_user, [email], msg.as_string())
                try:
                    server.quit()
                except Exception:
                    pass
                email_sent = True
                print(f"[DIRECT OTP EMAIL SUCCESS (Port 465 SSL)] To: {email} | Code: {code}")
            except Exception as e_ssl:
                print(f"[DIRECT OTP EMAIL ERROR (Port 465)] {e_ssl}")
                is_on_render = bool(os.getenv('RENDER') or os.getenv('RENDER_SERVICE_ID'))
                if is_on_render:
                    email_error = "Render Free Tier blocks outbound SMTP (ports 25, 465, 587). Please configure BREVO_API_KEY or RESEND_API_KEY in Render Environment Variables for live delivery."
                    print(f"[RENDER SMTP BLOCKED] {email_error}")
                else:
                    # Fallback to standard Django mail on non-render environments
                    try:
                        from django.core.mail import EmailMultiAlternatives
                        fallback_msg = EmailMultiAlternatives(
                            subject=subject,
                            body=plain_message,
                            from_email=from_email,
                            to=[email],
                            reply_to=[sender_email]
                        )
                        fallback_msg.attach_alternative(html_message, "text/html")
                        fallback_msg.send(fail_silently=False)
                        email_sent = True
                        print(f"[DIRECT OTP EMAIL FALLBACK (Port 587)] To: {email} | Code: {code}")
                    except Exception as e_fallback:
                        email_error = f"SSL: {e_ssl} | Fallback: {e_fallback}"
                        email_sent = False
                        print(f"[DIRECT OTP EMAIL FAILED] To: {email} | Error: {email_error}")
        elif not email_sent and not has_smtp_credentials:
            email_sent = False
            email_error = "Neither HTTP Email API (Brevo/Resend) nor SMTP credentials are configured."

        # Terminal feedback
        print(f"\n==========================================")
        print(f"[FINNEST REAL OTP DISPATCH COMPLETE]")
        print(f"To: {email}")
        print(f"Purpose: {purpose}")
        print(f"Code: {code} (Expires in {cls.EXPIRY_MINUTES}m)")
        print(f"SMTP Configured: {has_smtp_credentials}")
        print(f"Email Sent Successfully: {email_sent}")
        if email_error:
            print(f"Email Error Details: {email_error}")
        print(f"==========================================\n")

        return {
            'email': email,
            'purpose': purpose,
            'expires_in_minutes': cls.EXPIRY_MINUTES,
            'email_sent': email_sent,
            'email_error': email_error if settings.DEBUG else None,
        }

    @classmethod
    def verify_otp(cls, email: str, otp_code: str, purpose: str = 'register'):
        """
        Validates the OTP code against database records.
        Returns (is_valid: bool, message: str)
        """
        email = email.strip().lower()
        otp_code = str(otp_code).strip()

        # Find latest active OTP for this email and purpose
        otp_record = EmailOTP.objects.filter(
            email=email,
            purpose=purpose,
            is_used=False
        ).order_by('-created_at').first()

        if not otp_record:
            return False, "No active verification code found. Please request a new OTP."

        # Check attempts limit (anti brute-force)
        if otp_record.attempts >= cls.MAX_ATTEMPTS:
            otp_record.is_used = True
            otp_record.save()
            return False, "Too many failed attempts. This code has been invalidated. Please request a new one."

        # Check expiration
        if timezone.now() > otp_record.expires_at:
            otp_record.is_used = True
            otp_record.save()
            return False, "Verification code has expired. Please request a new OTP."

        # Check matching code
        if otp_record.otp_code != otp_code:
            otp_record.attempts += 1
            otp_record.save()
            remaining = cls.MAX_ATTEMPTS - otp_record.attempts
            return False, f"Incorrect verification code. {remaining} attempt(s) remaining."

        # Successfully matched
        otp_record.is_used = True
        otp_record.save()
        return True, "Verification successful."

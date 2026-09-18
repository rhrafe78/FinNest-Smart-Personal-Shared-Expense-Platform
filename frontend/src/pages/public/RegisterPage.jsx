import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { OTPInput } from '../../components/ui/OTPInput';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Step 1: Registration form
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    currency: 'BDT',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Step 2: OTP Verification
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [devPreviewCode, setDevPreviewCode] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const res = await api.post('/auth/register/', formData);
      setRegisteredEmail(res.data.email || formData.email);
      setDevPreviewCode(res.data.dev_preview_code || null);
      setEmailSent(Boolean(res.data.email_sent));
      setStep(2);
    } catch (err) {
      setFormError(
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        'Registration failed. Please check inputs.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await api.post('/auth/verify-otp/', {
        email: registeredEmail,
        otp_code: code,
        purpose: 'register',
      });

      // Save access and refresh tokens
      const { user, tokens } = res.data;
      localStorage.setItem('finnest_access_token', tokens.access);
      localStorage.setItem('finnest_refresh_token', tokens.refresh);
      localStorage.setItem('finnest_user', JSON.stringify(user));

      // Redirect directly to dashboard
      window.location.href = '/app/dashboard';
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Invalid OTP code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const res = await api.post('/auth/send-otp/', {
        email: registeredEmail,
        purpose: 'register',
      });
      if (res.data.dev_preview_code) {
        setDevPreviewCode(res.data.dev_preview_code);
      }
    } catch (err) {
      setOtpError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-7">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {step === 1 ? 'Create your account' : 'Verify your email'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {step === 1
              ? 'Real accounts backed by secure database OTP verification'
              : `We sent a 6-digit code to ${registeredEmail}`}
          </p>
        </div>

        {/* STEP 1: Personal Details Form */}
        {step === 1 ? (
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xl">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. John"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Primary Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="BDT">৳ BDT - Bangladeshi Taka</option>
                  <option value="USD">$ USD - US Dollar</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GBP">£ GBP - British Pound</option>
                  <option value="INR">₹ INR - Indian Rupee</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold mt-2"
                isLoading={formLoading}
              >
                Send Verification OTP
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* STEP 2: Real Database OTP Verification */
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xl space-y-6">
            <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>We've sent a 6-digit verification code to your email inbox! Please check your Inbox (or Spam folder).</span>
            </div>

            {devPreviewCode && (
              <div className="p-3 text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                <span>Your Verification Code: <strong className="font-mono text-sm font-bold tracking-widest ml-1">{devPreviewCode}</strong></span>
                <button
                  type="button"
                  onClick={() => handleVerifyOTP(devPreviewCode)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Auto Fill &amp; Verify
                </button>
              </div>
            )}

            <OTPInput
              length={6}
              onComplete={handleVerifyOTP}
              onResend={handleResendOTP}
              isLoading={otpLoading}
              error={otpError}
            />

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to details
              </button>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" /> 10m Real Expiry
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

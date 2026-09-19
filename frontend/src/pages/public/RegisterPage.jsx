import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff, Check, X } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Step 2: OTP Verification
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  // Strong password rule checks
  const pass = formData.password;
  const hasMinLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const isPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber;
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isPasswordStrong) {
      setFormError('Please ensure your password meets all strong password requirements (8+ chars, capital & small letters, and numbers).');
      return;
    }

    setFormLoading(true);
    const cleanPayload = {
      ...formData,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim().toLowerCase(),
    };
    try {
      const res = await api.post('/auth/register/', cleanPayload);
      setRegisteredEmail(res.data.email || cleanPayload.email);
      setEmailSent(Boolean(res.data.email_sent));
      const code = res.data.otp_code || res.data.debug_otp;
      if (code) {
        setDevOtp(code);
      }
      setStep(2);
    } catch (err) {
      const emailError = err.response?.data?.email?.[0];
      if (emailError && emailError.toLowerCase().includes('already exists')) {
        setFormError('already_exists');
      } else {
        setFormError(
          err.response?.data?.password?.[0] ||
          emailError ||
          err.response?.data?.detail ||
          'Registration failed. Please check inputs.'
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await api.post('/auth/verify-otp/', {
        email: registeredEmail.trim().toLowerCase(),
        otp_code: String(code).trim(),
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
    setOtpError('');
    setResendSuccess(false);
    try {
      const res = await api.post('/auth/send-otp/', {
        email: registeredEmail.trim().toLowerCase(),
        purpose: 'register',
      });
      const code = res.data.otp_code || res.data.debug_otp;
      if (code) {
        setDevOtp(code);
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 6000);
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
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
              {formError === 'already_exists' ? (
                <div className="p-3.5 text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-900 space-y-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>⚠️ An account with this email already exists!</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Your account is already registered. Please sign in directly with your email and password without OTP.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400 hover:underline pt-0.5"
                  >
                    Go to Sign In Page →
                  </Link>
                </div>
              ) : formError ? (
                <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
                  {formError}
                </div>
              ) : null}

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
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 chars with A-Z, a-z, 0-9"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength & requirements checklist */}
                {pass.length > 0 && (
                  <div className="mt-2.5 space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs">
                    {/* Strength meter bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                        <span
                          className={
                            strengthScore <= 2
                              ? 'text-rose-500 font-bold'
                              : strengthScore === 3
                              ? 'text-amber-500 font-bold'
                              : 'text-emerald-500 font-bold'
                          }
                        >
                          {strengthScore <= 2 ? 'Weak' : strengthScore === 3 ? 'Medium' : 'Strong & Secure ✓'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                        <div className={`rounded-full transition-all ${strengthScore >= 1 ? (strengthScore <= 2 ? 'bg-rose-500' : strengthScore === 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-800'}`} />
                        <div className={`rounded-full transition-all ${strengthScore >= 2 ? (strengthScore <= 2 ? 'bg-rose-500' : strengthScore === 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-800'}`} />
                        <div className={`rounded-full transition-all ${strengthScore >= 3 ? (strengthScore === 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-800'}`} />
                        <div className={`rounded-full transition-all ${strengthScore >= 4 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                      </div>
                    </div>

                    {/* Check items */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                        {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />}
                        <span>8+ Characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                        {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />}
                        <span>Capital letter (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                        {hasLower ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />}
                        <span>Small letter (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                        {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />}
                        <span>Number (0-9)</span>
                      </div>
                    </div>
                  </div>
                )}
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
            <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Verification code sent to {registeredEmail}</span>
              </div>
              <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 pl-6">
                Please check your Inbox (or Spam folder). If using the Gmail mobile app, swipe down to refresh.
              </p>
            </div>

            {devOtp && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-brand-50 dark:from-indigo-950/50 dark:to-brand-950/40 border border-indigo-200/80 dark:border-indigo-800/80 shadow-md space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      Verification Code
                    </span>
                    <span className="text-3xl font-black font-mono tracking-widest text-slate-900 dark:text-white">
                      {devOtp}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleVerifyOTP(devOtp)}
                    className="font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all text-xs shrink-0"
                    isLoading={otpLoading}
                  >
                    One-Click Verify →
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ⚡ Use this instant code or type the 6 digits below to complete verification.
                </p>
              </div>
            )}

            <OTPInput
              length={6}
              onComplete={handleVerifyOTP}
              onResend={handleResendOTP}
              isLoading={otpLoading}
              error={otpError}
              resendSuccess={resendSuccess}
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

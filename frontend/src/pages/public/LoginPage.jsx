import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, KeyRound, Key } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { OTPInput } from '../../components/ui/OTPInput';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithOTP } = useAuth();

  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'

  // Password mode states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP mode states
  const [otpStep, setOtpStep] = useState(1); // 1 = enter email, 2 = enter 6-digit OTP
  const [otpEmail, setOtpEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [devPreviewCode, setDevPreviewCode] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLoginOTP = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await api.post('/auth/send-otp/', {
        email: otpEmail,
        purpose: 'login',
      });
      setDevPreviewCode(res.data.dev_preview_code || null);
      setEmailSent(Boolean(res.data.email_sent));
      setOtpStep(2);
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Account with this email does not exist.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyLoginOTP = async (code) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      await loginWithOTP(otpEmail, code);
      navigate('/app/dashboard');
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Invalid or expired OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendLoginOTP = async () => {
    try {
      const res = await api.post('/auth/send-otp/', {
        email: otpEmail,
        purpose: 'login',
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
            Welcome back to FinNest
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage your money and mess expenses
          </p>
        </div>

        {/* Authentication Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xl space-y-5">
          {/* Method Selector Tabs */}
          <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'password'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" /> Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setOtpStep(1);
                setOtpError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'otp'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Instant OTP Login
            </button>
          </div>

          {/* PASSWORD TAB */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="rafi@finnest.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold mt-2"
                isLoading={loading}
              >
                Sign In to FinNest
              </Button>
            </form>
          )}

          {/* OTP TAB */}
          {authMode === 'otp' && (
            <div>
              {otpStep === 1 ? (
                <form onSubmit={handleSendLoginOTP} className="space-y-4">
                  {otpError && (
                    <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
                      {otpError}
                    </div>
                  )}

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter your registered account email. We will generate and store a 6-digit security OTP directly in the database.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Account Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. rafi@finnest.com"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold mt-2"
                    isLoading={otpLoading}
                  >
                    Send 6-Digit OTP
                  </Button>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Enter the 6-digit OTP code sent to:
                    </p>
                    <p className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      {otpEmail}
                    </p>
                  </div>

                  <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>We've sent a 6-digit verification code to your email inbox! Please check your Inbox (or Spam folder).</span>
                  </div>

                  {devPreviewCode && (
                    <div className="p-3 text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                      <span>Login OTP Code: <strong className="font-mono text-sm font-bold tracking-widest ml-1">{devPreviewCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleVerifyLoginOTP(devPreviewCode)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Auto Fill &amp; Sign In
                      </button>
                    </div>
                  )}

                  <OTPInput
                    length={6}
                    onComplete={handleVerifyLoginOTP}
                    onResend={handleResendLoginOTP}
                    isLoading={otpLoading}
                    error={otpError}
                  />

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Change email
                    </button>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" /> 10m Expiry
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

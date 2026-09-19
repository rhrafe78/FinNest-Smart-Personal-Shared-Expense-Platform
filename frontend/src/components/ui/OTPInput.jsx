import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export const OTPInput = ({
  length = 6,
  onComplete,
  onResend,
  isLoading = false,
  error = '',
  resendSuccess = false,
}) => {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    const lastChar = cleaned[cleaned.length - 1];
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    setDigits(newDigits);

    // Auto focus next box
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    if (newDigits.every((d) => d !== '')) {
      onComplete?.(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (digits.every((d) => d !== '')) {
        onComplete?.(digits.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setDigits(newDigits);

    // Focus appropriate box
    const nextIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pasteData.length === length) {
      onComplete?.(pasteData);
    }
  };

  const handleResendClick = () => {
    if (timeLeft > 0 || isLoading) return;
    setTimeLeft(60);
    onResend?.();
    inputRefs.current[0]?.focus();
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="space-y-5">
      {resendSuccess && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-900 text-center font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>A fresh verification code has been dispatched to your email!</span>
        </div>
      )}

      {error && (
        <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900 text-center font-medium">
          {error}
        </div>
      )}

      {/* 6-box PIN digit inputs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              digit
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-slate-900 dark:text-white'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
            }`}
          />
        ))}
      </div>

      {/* Primary Submit Button */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full font-bold shadow-md shadow-brand-500/20"
        onClick={() => {
          if (isComplete) {
            onComplete?.(digits.join(''));
          }
        }}
        isLoading={isLoading}
        disabled={!isComplete || isLoading}
      >
        Verify &amp; Continue
      </Button>

      {/* Timer & Resend Button */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span>
          {timeLeft > 0 ? (
            <span>Resend code in <strong className="font-mono text-slate-700 dark:text-slate-200">{timeLeft}s</strong></span>
          ) : (
            <span>Didn't receive the code?</span>
          )}
        </span>

        <button
          type="button"
          disabled={timeLeft > 0 || isLoading}
          onClick={handleResendClick}
          className={`font-semibold transition-colors flex items-center gap-1 ${
            timeLeft > 0 || isLoading
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-brand-600 dark:text-brand-400 hover:underline'
          }`}
        >
          <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Resend OTP
        </button>
      </div>
    </div>
  );
};

import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    brand: 'bg-indigo-100 text-indigo-800 dark:bg-brand-950/70 dark:text-brand-300 border-indigo-200 dark:border-brand-800 font-semibold',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-semibold',
    warning: 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-semibold',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold',
    info: 'bg-sky-100 text-sky-800 dark:bg-cyan-950/70 dark:text-cyan-300 border-sky-200 dark:border-cyan-800 font-semibold',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

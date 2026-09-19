import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-sm border border-brand-500/50 dark:border-brand-500/30 focus:ring-brand-500",
    secondary: "bg-slate-100 hover:bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 focus:ring-slate-400",
    outline: "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 focus:ring-brand-500 shadow-sm",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-emerald-500/50 focus:ring-emerald-500",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-rose-500/50 focus:ring-rose-500",
    ghost: "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60",
  };

  const sizes = {
    xs: "text-xs px-2.5 py-1 gap-1 rounded-lg",
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-sm sm:text-base px-5 py-2.5 gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && <Icon className="w-4 h-4 text-current" />
      )}
      <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">{children}</span>
    </button>
  );
};

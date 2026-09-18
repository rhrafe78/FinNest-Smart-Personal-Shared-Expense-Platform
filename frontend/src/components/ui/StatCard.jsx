import React from 'react';

export const StatCard = ({
  title,
  amount,
  currency = '৳',
  icon: Icon,
  trend,
  trendPositive,
  subtitle,
  variant = 'default',
}) => {
  const iconBgMap = {
    default: 'bg-indigo-100 text-indigo-700 dark:bg-brand-950/70 dark:text-brand-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-400',
  };

  const cardGradientMap = {
    default: 'bg-gradient-to-br from-indigo-50/50 via-white to-white border-indigo-100/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.08)]',
    emerald: 'bg-gradient-to-br from-emerald-50/60 via-white to-white border-emerald-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)]',
    rose: 'bg-gradient-to-br from-rose-50/60 via-white to-white border-rose-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.1)]',
    amber: 'bg-gradient-to-br from-amber-50/60 via-white to-white border-amber-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)]',
    indigo: 'bg-gradient-to-br from-indigo-50/60 via-white to-white border-indigo-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)]',
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '0';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border dark:bg-[#111827] p-5 transition-all hover:shadow-lg ${cardGradientMap[variant] || cardGradientMap.default}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl shadow-sm ${iconBgMap[variant] || iconBgMap.default}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
          {currency}
        </span>
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {formatCurrency(amount)}
        </span>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-bold ${
                trendPositive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

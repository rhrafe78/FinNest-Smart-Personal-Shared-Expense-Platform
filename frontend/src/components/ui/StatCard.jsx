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
  const iconStyleMap = {
    default: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
  };

  const borderAccentMap = {
    default: 'hover:border-slate-300 dark:hover:border-slate-700',
    emerald: 'hover:border-emerald-300 dark:hover:border-emerald-800/80',
    rose: 'hover:border-rose-300 dark:hover:border-rose-800/80',
    amber: 'hover:border-amber-300 dark:hover:border-amber-800/80',
    indigo: 'hover:border-indigo-300 dark:hover:border-indigo-800/80',
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '0.00';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className={`relative bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 p-5 shadow-sm transition-all duration-150 ${borderAccentMap[variant] || borderAccentMap.default}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl shrink-0 ${iconStyleMap[variant] || iconStyleMap.default}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-lg font-medium text-slate-400 dark:text-slate-500">
          {currency}
        </span>
        <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
          {formatCurrency(amount)}
        </span>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ml-auto ${
                trendPositive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
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

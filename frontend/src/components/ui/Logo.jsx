import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'md', to = '/' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className="flex items-center gap-2.5 font-bold tracking-tight select-none">
      <div className={`${sizeClasses[size]} relative flex items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm border border-brand-500/40`}>
        {/* FinNest clean geometric wallet & shared coin icon */}
        <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`${textClasses[size]} font-bold leading-none tracking-tight text-slate-900 dark:text-white`}>
          Fin<span className="text-brand-600 dark:text-brand-400 font-extrabold">Nest</span>
        </span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-flex items-center">{content}</Link>;
  }
  return content;
};

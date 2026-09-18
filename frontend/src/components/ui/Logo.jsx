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
    <div className="flex items-center gap-2.5 font-bold tracking-tight">
      <div className={`${sizeClasses[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md shadow-brand-500/25`}>
        {/* FinNest icon glyph */}
        <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 text-white" fill="currentColor">
          <path d="M4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14C20 13 19 12 18 12C17 12 16.5 13 16.5 14C16.5 16.4853 14.4853 18.5 12 18.5C9.51472 18.5 7.5 16.4853 7.5 14C7.5 13 6.8 12 5.8 12C4.8 12 4 13 4 14Z" fill="currentColor" opacity="0.75" />
          <circle cx="12" cy="7.5" r="4.5" fill="#10B981" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`${textClasses[size]} font-extrabold leading-none tracking-tight text-slate-900 dark:text-white`}>
          Fin<span className="text-brand-600 dark:text-brand-400">Nest</span>
        </span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-flex items-center">{content}</Link>;
  }
  return content;
};

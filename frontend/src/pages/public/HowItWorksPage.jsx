import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Home, Divide, Scale, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const HowItWorksPage = () => {
  const steps = [
    {
      step: '01',
      icon: UserPlus,
      title: 'Create Your Account',
      desc: 'Sign up in seconds, pick your currency (৳ BDT, $ USD, € EUR, etc.), and set your monthly income preference.',
    },
    {
      step: '02',
      icon: Home,
      title: 'Create or Join a Household',
      desc: 'Create a household for your apartment, mess, or family, and share your unique 8-character code with roommates.',
    },
    {
      step: '03',
      icon: Divide,
      title: 'Log Personal & Shared Costs',
      desc: 'Record your daily spending or add group expenses with Equal, Exact, Percentage, or Share-based split configurations.',
    },
    {
      step: '04',
      icon: Scale,
      title: 'Settle Debts with 1-Click Simplification',
      desc: 'View live net balances. Our engine calculates who should pay whom directly with minimum cross-transactions.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How FinNest Works
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Four simple steps to total personal clarity and frictionless roommate expense sharing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 relative overflow-hidden"
            >
              <div className="text-4xl font-extrabold text-slate-100 dark:text-slate-800/80 absolute top-4 right-6 select-none">
                {s.step}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {s.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-8">
        <Link to="/register">
          <Button variant="primary" size="lg">
            Start Right Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

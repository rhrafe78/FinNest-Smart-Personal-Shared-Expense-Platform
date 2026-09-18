import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Building,
  Users2,
  PiggyBank,
  Target,
  Receipt,
  ShoppingCart,
  CalendarDays,
  ShieldCheck,
  Zap,
  Divide,
  Scale,
  DownloadCloud
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const FeaturesPage = () => {
  const featureList = [
    {
      icon: TrendingUp,
      title: 'Unified Personal Ledger',
      desc: 'Seamlessly track incomes and expenses across custom categories, bank transfers, credit cards, and mobile banking with exact Decimal accuracy.',
    },
    {
      icon: Building,
      title: 'Shared Mess & Household Hub',
      desc: 'Form or join apartments and bachelor messes. Manage members with Owner, Admin, and Member permission levels.',
    },
    {
      icon: Divide,
      title: '4-Way Mathematical Splitting',
      desc: 'Split shared expenses equally, by exact amount, by strict 100% percentage validation, or by proportional shares.',
    },
    {
      icon: Scale,
      title: 'Smart Debt Simplification',
      desc: 'Our proprietary greedy algorithm reduces multi-party roommate debts into the minimal number of direct transfers.',
    },
    {
      icon: PiggyBank,
      title: 'Dynamic Category Budgets',
      desc: 'Configure monthly budgets with custom alert thresholds (e.g. 80%) to receive proactive warnings before exceeding limits.',
    },
    {
      icon: Target,
      title: 'Goal Tracker & Projections',
      desc: 'Track tech purchases, emergency funds, and travel milestones with automated recommended monthly saving calculation.',
    },
    {
      icon: CalendarDays,
      title: 'Recurring Household Bills',
      desc: 'Track electricity, Wi-Fi, rent, and water bills with automated due date tracking (Upcoming, Due Soon, Paid, Overdue).',
    },
    {
      icon: ShoppingCart,
      title: 'Collaborative Grocery List',
      desc: 'Plan weekly market bazaar items collaboratively and convert purchased items into a shared expense with one click.',
    },
    {
      icon: DownloadCloud,
      title: 'Comprehensive Data Export',
      desc: 'Export personal transactions and household mess expenses into CSV files for tax audits, spreadsheets, and archiving.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Every feature you need to master your money.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          From your morning coffee expense to the monthly bachelor mess rent split, FINNEST delivers institutional-grade financial tooling for modern living.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-8">
        <Link to="/register">
          <Button variant="primary" size="lg">
            Experience All Features Free
          </Button>
        </Link>
      </div>
    </div>
  );
};

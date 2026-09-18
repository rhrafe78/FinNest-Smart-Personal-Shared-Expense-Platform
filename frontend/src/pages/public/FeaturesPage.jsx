import React, { useState } from 'react';
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
  DownloadCloud,
  PieChart,
  Bell,
  Wallet,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const FeaturesPage = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Features' },
    { id: 'PERSONAL', label: 'Personal Finance' },
    { id: 'SHARED', label: 'Mess & Shared Living' },
    { id: 'ANALYTICS', label: 'Analytics & Tools' },
  ];

  const features = [
    {
      category: 'PERSONAL',
      badge: 'Personal',
      icon: TrendingUp,
      title: 'Daily Income & Expense Ledger',
      desc: 'Log every transaction with custom categories, payment methods (Cash, Bank, bKash, Nagad), notes, and receipt attachments with exact Decimal precision.',
      color: 'indigo',
      lightBg: 'from-indigo-100/70 via-indigo-50/40 to-white',
      borderColor: 'border-indigo-200 dark:border-slate-800',
      iconBg: 'bg-indigo-600 text-white',
      badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      category: 'PERSONAL',
      badge: 'Personal',
      icon: PiggyBank,
      title: 'Category Budgets & 80% Alerts',
      desc: 'Set monthly spending limits for Food, Transport, Shopping, or Entertainment. Visual progress bars notify you when reaching 80% threshold before overspending.',
      color: 'amber',
      lightBg: 'from-amber-100/70 via-amber-50/40 to-white',
      borderColor: 'border-amber-200 dark:border-slate-800',
      iconBg: 'bg-amber-500 text-white',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      category: 'PERSONAL',
      badge: 'Personal',
      icon: Target,
      title: 'Savings Goals & Target Tracker',
      desc: 'Track tech purchases, emergency funds, vacations, or wedding savings. Automatically calculates the recommended monthly deposit rate to hit your target date.',
      color: 'sky',
      lightBg: 'from-sky-100/70 via-sky-50/40 to-white',
      borderColor: 'border-sky-200 dark:border-slate-800',
      iconBg: 'bg-sky-600 text-white',
      badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    },
    {
      category: 'SHARED',
      badge: 'Mess Shared',
      icon: Building,
      title: 'Shared Mess & Roommate Hub',
      desc: 'Create or join a bachelor mess, flatmate apartment, or family household. Manage members with Owner, Admin, and Member permission access controls.',
      color: 'emerald',
      lightBg: 'from-emerald-100/70 via-emerald-50/40 to-white',
      borderColor: 'border-emerald-200 dark:border-slate-800',
      iconBg: 'bg-emerald-600 text-white',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      category: 'SHARED',
      badge: 'Mess Shared',
      icon: Divide,
      title: '4-Way Expense Splitting Engine',
      desc: 'Split shared expenses with 4 flexible math models: Equal Split, Exact Amount Split, 100% Percentage Split, or Room/Meal Share-based Split.',
      color: 'purple',
      lightBg: 'from-purple-100/70 via-purple-50/40 to-white',
      borderColor: 'border-purple-200 dark:border-slate-800',
      iconBg: 'bg-purple-600 text-white',
      badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    },
    {
      category: 'SHARED',
      badge: 'Mess Shared',
      icon: Scale,
      title: 'Smart Debt Simplification & Settlement',
      desc: 'Eliminate chaotic cross-payments between roommates. Our greedy net algorithm simplifies group debts into the absolute minimum direct payments.',
      color: 'teal',
      lightBg: 'from-teal-100/70 via-teal-50/40 to-white',
      borderColor: 'border-teal-200 dark:border-slate-800',
      iconBg: 'bg-teal-600 text-white',
      badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    },
    {
      category: 'SHARED',
      badge: 'Mess Shared',
      icon: CalendarDays,
      title: 'Recurring Utility & Rent Bills',
      desc: 'Manage flat rent, electricity, Wi-Fi, water, and cook/maid bills. Track due dates with status tags (Upcoming, Due Soon, Paid, Overdue) and member payment status.',
      color: 'rose',
      lightBg: 'from-rose-100/70 via-rose-50/40 to-white',
      borderColor: 'border-rose-200 dark:border-slate-800',
      iconBg: 'bg-rose-500 text-white',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      category: 'SHARED',
      badge: 'Mess Shared',
      icon: ShoppingCart,
      title: 'Collaborative Grocery Bazaar List',
      desc: 'Roommates can collaboratively add items to the weekly bazaar list. When items are purchased, convert them into an equal shared expense in just 1 click.',
      color: 'emerald',
      lightBg: 'from-emerald-100/70 via-teal-50/40 to-white',
      borderColor: 'border-emerald-200 dark:border-slate-800',
      iconBg: 'bg-emerald-600 text-white',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      category: 'ANALYTICS',
      badge: 'Analytics & Tools',
      icon: PieChart,
      title: 'Visual Spending Analytics & Trends',
      desc: 'Gain instant financial clarity with monthly income vs. expense bar charts, category donut breakdowns, and net household balance insights.',
      color: 'indigo',
      lightBg: 'from-indigo-100/70 via-blue-50/40 to-white',
      borderColor: 'border-indigo-200 dark:border-slate-800',
      iconBg: 'bg-indigo-600 text-white',
      badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      category: 'ANALYTICS',
      badge: 'Analytics & Tools',
      icon: DownloadCloud,
      title: 'One-Click CSV & Excel Export',
      desc: 'Download your personal transactions or the entire household mess expense ledger as CSV files for monthly audits, Excel analysis, and tax records.',
      color: 'cyan',
      lightBg: 'from-cyan-100/70 via-sky-50/40 to-white',
      borderColor: 'border-cyan-200 dark:border-slate-800',
      iconBg: 'bg-cyan-600 text-white',
      badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    },
    {
      category: 'ANALYTICS',
      badge: 'Analytics & Tools',
      icon: Bell,
      title: 'Real-Time Alerts & Notifications',
      desc: 'Stay informed when an 80% budget limit is reached, a utility bill is due soon, a new shared expense is added, or a debt settlement is recorded.',
      color: 'amber',
      lightBg: 'from-amber-100/70 via-yellow-50/40 to-white',
      borderColor: 'border-amber-200 dark:border-slate-800',
      iconBg: 'bg-amber-500 text-white',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      category: 'ANALYTICS',
      badge: 'Analytics & Tools',
      icon: Wallet,
      title: 'Multi-Currency & Decimal Precision',
      desc: 'Switch between Bangladeshi Taka (৳ BDT) and US Dollar ($ USD). All financial computations use exact banking Decimal arithmetic on PostgreSQL with zero floating point errors.',
      color: 'violet',
      lightBg: 'from-violet-100/70 via-purple-50/40 to-white',
      borderColor: 'border-violet-200 dark:border-slate-800',
      iconBg: 'bg-violet-600 text-white',
      badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
    },
  ];

  const filteredFeatures = activeCategory === 'ALL'
    ? features
    : features.filter((f) => f.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Complete Feature Suite</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything FINNEST Can Do for You
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          From personal daily ledger and category budgets to shared flat rent, bazaar lists, and roommate debt settlement—explore all 12 core capabilities.
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === c.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${f.badgeClass}`}>
                    {f.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Active in Platform</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  ● Available Now
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <Link to="/register">
          <Button variant="primary" size="lg" className="px-7 py-3 font-semibold text-sm shadow-sm">
            Start Using All Features Free <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};


import React from 'react';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-2">
          <Logo size="lg" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About FinNest
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          "Manage your money. Share expenses. Stay in control."
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6 text-base leading-relaxed">
        <p>
          FINNEST was conceived out of a universal financial friction: people manage their personal savings and discretionary expenditures, but the moment they share an apartment, enter a bachelor mess, or coordinate with family members, financial chaos usually ensues.
        </p>
        <p>
          Mess managers rely on paper notebooks, messy WhatsApp chats, or separate single-purpose calculators. When bills arrive for Wi-Fi, electricity, gas, and groceries, nobody has an exact calculation of who paid what and who truly owes whom.
        </p>
        <p>
          We built FINNEST to unite both domains seamlessly in a single SaaS experience. By implementing mathematically rigorous zero-float Decimal arithmetic and our greedy Debt Simplification algorithm, FINNEST ensures complete transparency and effortless settlement without straining relationships.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Precision Math</h3>
          <p className="text-xs text-slate-500">Every cent and poisha accounted for accurately with Decimal logic.</p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Smart Insights</h3>
          <p className="text-xs text-slate-500">Actionable advice on your spending patterns and goal timelines.</p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Designed for Scale</h3>
          <p className="text-xs text-slate-500">Built on Django REST Framework, React 18, and PostgreSQL.</p>
        </div>
      </div>
    </div>
  );
};

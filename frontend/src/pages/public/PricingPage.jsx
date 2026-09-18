import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PricingPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Transparent, Fair Pricing
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Start for free forever. Upgrade anytime when your mess or shared household needs premium collaborative features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Tier */}
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase text-slate-500">Personal Free</span>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white">৳ 0</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete personal money management and budget tools.
            </p>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Personal Incomes & Expenses</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 3 Monthly Budgets</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2 Savings Goals</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 Shared Household (4 members)</div>
            </div>
          </div>
          <Link to="/register">
            <Button variant="outline" className="w-full">Get Started Free</Button>
          </Link>
        </div>

        {/* Pro / Mess Tier */}
        <div className="p-8 rounded-3xl border-2 border-brand-500 bg-white dark:bg-[#111827] relative shadow-xl shadow-brand-500/10 flex flex-col justify-between space-y-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white text-[11px] font-bold">
            POPULAR FOR MESSES
          </div>
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400">Mess Pro</span>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white">৳ 299 <span className="text-sm font-normal text-slate-400">/mo</span></div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Everything needed for flatmates, bachelor messes, and student apartments.
            </p>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Everything in Personal Free</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Unlimited Households & Roommates</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Smart Debt Simplification Algorithm</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Grocery Market Checklist & 1-Click Convert</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Receipt Image & Invoice Attachment</div>
            </div>
          </div>
          <Link to="/register">
            <Button variant="primary" className="w-full">Choose Mess Pro</Button>
          </Link>
        </div>

        {/* Enterprise Tier */}
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase text-slate-500">Family Office</span>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white">৳ 699 <span className="text-sm font-normal text-slate-400">/mo</span></div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-property households, joint family trusts, and custom integrations.
            </p>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Everything</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-Currency Real-Time Conversion</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Certified CSV & PDF Audit Reports</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority 24/7 Concierge Support</div>
            </div>
          </div>
          <Link to="/contact">
            <Button variant="outline" className="w-full">Contact Team</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

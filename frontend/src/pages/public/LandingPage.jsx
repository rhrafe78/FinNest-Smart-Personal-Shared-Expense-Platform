import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Users2,
  PieChart,
  Receipt,
  Sparkles,
  Calculator,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Building,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  // Interactive Live Split Playground
  const [demoAmount, setDemoAmount] = useState(3600);
  const [demoMembers, setDemoMembers] = useState(4);

  const memberNames = ['You (Host)', 'Tanvir', 'Arif', 'Sakib', 'Fahim', 'Imran'];
  const activeMembers = memberNames.slice(0, demoMembers);
  const perPersonShare = demoAmount > 0 ? (demoAmount / demoMembers) : 0;
  const youReceiveTotal = demoAmount - perPersonShare;

  const faqs = [
    {
      q: 'Does FinNest keep my personal expenses separate from shared household costs?',
      a: 'Yes, 100% separate. Your personal salary, savings, and individual expenses are completely private. Roommates only see bills explicitly added to the shared household ledger.'
    },
    {
      q: 'How does expense splitting work between roommates?',
      a: 'You can split expenses equally with one click, by exact amounts, or by custom room shares. FinNest automatically calculates every member\'s fair contribution.'
    },
    {
      q: 'How does Smart Debt Simplification work?',
      a: 'Instead of members sending money back and forth multiple times, FinNest computes the net balances and simplifies all debts into the minimum number of direct transfers.'
    },
    {
      q: 'Is FinNest free to use?',
      a: 'Yes. Core personal budgeting, household mess management, and debt simplification are completely free for all members.'
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* 1. HERO SECTION (Airy, Spacious, Human) */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-sm text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
            <span>Smart Personal Wallet & Household Mess Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Personal budgeting & shared expenses —<br />
            <span className="text-brand-600 dark:text-brand-400">
              all in one clean, transparent ledger.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Track groceries, flat rent, roommate utility bills, and personal monthly savings without sticky notes or complicated mental math.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            {isAuthenticated ? (
              <Link to="/app/dashboard">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm font-semibold px-8 py-3.5 shadow-sm shadow-brand-500/20">
                  Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm font-semibold px-8 py-3.5 shadow-sm shadow-brand-500/20">
                    Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-semibold px-8 py-3.5">
                    Log in
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Private & Secure</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Instant Settlement</span>
            <span className="flex items-center gap-2"><Users2 className="w-4 h-4 text-brand-500" /> Unlimited Roommates</span>
          </div>
        </div>

        {/* 2. INTERACTIVE SPLIT PLAYGROUND (Clean, Spacious, Human) */}
        <div className="max-w-4xl mx-auto px-6 mt-16 sm:mt-24">
          <div className="fin-card p-6 sm:p-10 space-y-8 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Live Expense Split Calculator
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Adjust the bill amount and member count to see balances resolve in real-time.
                </p>
              </div>
              <Badge variant="brand" className="self-start sm:self-auto text-xs py-1 px-3">
                Interactive Demo
              </Badge>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Total Bill Amount (৳)
                </label>
                <input
                  type="number"
                  value={demoAmount}
                  onChange={(e) => setDemoAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <div className="flex gap-2 pt-1">
                  {[1200, 2400, 3600, 6000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDemoAmount(amt)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-colors ${
                        demoAmount === amt
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Roommates Count ({demoMembers} people)
                </label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setDemoMembers(count)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                        demoMembers === count
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 pt-1">Paid out-of-pocket by: <strong>You (Host)</strong></p>
              </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Each Member\'s Fair Share
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  ৳{perPersonShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Total ৳{demoAmount.toLocaleString()} split equally among {demoMembers} people
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  You Receive Back from Group
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  +৳{youReceiveTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 pt-1">
                  Remaining {demoMembers - 1} members owe you ৳{perPersonShare.toFixed(0)} each
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE CORE PILLARS (Clean, Breathable, High-Craft) */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Real-World Financial Tools
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Designed for modern living and roommates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Everything you need for bachelor mess management and personal wallet tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Mess Management */}
          <div className="fin-card p-7 sm:p-8 space-y-4 hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Roommate & Mess Ledger
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Rent, utilities, groceries, and maid expenses split fairly. Zero month-end disputes or missing receipts.
              </p>
            </div>
          </div>

          {/* Pillar 2: Personal Wallet */}
          <div className="fin-card p-7 sm:p-8 space-y-4 hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Personal Budgeting
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Know exactly where your salary goes. Log daily expenses in seconds and protect your monthly savings goals.
              </p>
            </div>
          </div>

          {/* Pillar 3: Debt Simplification */}
          <div className="fin-card p-7 sm:p-8 space-y-4 hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Automated Settlement
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Our algorithm minimizes transactions so members can settle all debts with 1 or 2 quick digital transfers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION (Spacious & Calm) */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about FinNest
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="fin-card overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-5 text-left text-sm font-semibold flex items-center justify-between text-slate-800 dark:text-white hover:text-brand-600 transition-colors"
              >
                <span className="pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${activeFaq === i ? 'rotate-180 text-brand-600' : 'text-slate-400'}`} />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER (Spacious & Minimalist) */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-brand-600 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6 border border-brand-500/40">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Start managing your money today
            </h3>
            <p className="text-brand-100 text-xs sm:text-sm max-w-md">
              Take complete control of your wallet and shared expenses with zero hassle.
            </p>
          </div>

          <div className="shrink-0">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-slate-100 font-bold px-7 py-3 text-xs shadow-sm">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

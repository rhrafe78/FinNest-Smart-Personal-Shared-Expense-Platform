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
  Divide,
  Calculator,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Building,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeSplitTab, setActiveSplitTab] = useState('EQUAL');

  const faqs = [
    {
      q: 'How does FINNEST combine personal finance with shared mess expenses?',
      a: 'With one account, FINNEST lets you keep your personal budget, savings, and bank ledger private, while participating in one or multiple shared households (e.g. bachelor mess, flatmates, family). Shared expenses are partitioned transparently without leaking private transactions.'
    },
    {
      q: 'What split methods are supported for roommates and messes?',
      a: 'We support four mathematical split methods: Equal Split (divided uniformly), Exact Amount Split, Percentage Split (enforcing 100% sum verification), and Share-Based Split (e.g. 2 shares for a double room, 1 share for single).'
    },
    {
      q: 'How does the Smart Debt Simplification algorithm work?',
      a: 'Instead of having 4 roommates perform 6 or 12 individual cross-transfers (A owes B, B owes C, etc.), our greedy net-settlement engine analyzes total net balances and simplifies them into the minimum required payments (at most N - 1 transfers).'
    },
    {
      q: 'Can we convert grocery checklists directly into shared expenses?',
      a: 'Yes! Household members can collaborate on a live grocery market checklist, mark items purchased with actual prices, and convert the entire purchase into an equal shared expense in one click.'
    },
    {
      q: 'Is my financial data secure?',
      a: 'All data is encrypted in transit and rest using industry standard JWT authentication, strict object-level permissions, and zero-float Decimal arithmetic on PostgreSQL.'
    },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Smart Personal & Shared Expense Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Manage your money.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 dark:from-brand-400 dark:via-indigo-300 dark:to-emerald-400">
              Share expenses. Stay in control.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            The dual-engine fintech platform built for individuals, bachelor messes, roommates, and families. Track wealth, budget accurately, and simplify group debt effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link to="/app/dashboard">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 font-bold">
                  Launch FinNest Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 font-bold">
                    Start Managing Your Money <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-7 py-3.5 font-bold border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                    Sign In to Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Bank-grade Decimal Math</span>
            <span className="flex items-center gap-1.5"><Users2 className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Unlimited Households</span>
          </div>
        </div>

        {/* 2. PRODUCT DASHBOARD PREVIEW MOCKUP */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 sm:mt-20">
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 sm:p-6 shadow-sm">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-3 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  finnest.app/dashboard
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-3 py-0.5 rounded-full font-semibold">
                  ● Live System Connected
                </span>
              </div>
            </div>

            {/* Dashboard Inner Grid Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Total Balance</span>
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-center text-xs font-bold shrink-0">৳</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">৳ 127,000.00</div>
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-3 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" /> +14.2% this month
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Green View Mess Net</span>
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center text-xs shrink-0">
                      <Building className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">+৳ 16,800.00</div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">3 roommates owe you</div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Food Budget Used</span>
                    <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800 flex items-center justify-center text-xs shrink-0">
                      <PieChart className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">57.5%</div>
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-3">৳5,100 left of ৳12,000</div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-sky-400 dark:hover:border-sky-600 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">MacBook Pro Goal</span>
                    <span className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800 flex items-center justify-center text-xs shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-sky-600 dark:text-cyan-400 tracking-tight">69.6%</div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">৳195,000 of ৳280,000</div>
              </div>
            </div>

            {/* Split & Debt Simplification Visualizer Card */}
            <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-left">
                <Badge variant="brand">Smart Debt Simplification Active</Badge>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Green View Mess — 4 Roommates, 1 Optimal Settlement Plan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  6 complex shared expenses (Rent, Wi-Fi, Electricity, Grocery, Maid) mathematically resolved into minimum direct transactions.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 w-full md:w-auto">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                  <span className="font-bold text-slate-800 dark:text-white">Karim</span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold">&rarr;</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Rafi</span>
                  <span className="font-bold ml-auto text-emerald-600 dark:text-emerald-400">৳2,000.00</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold font-sans">Settled</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                  <span className="font-bold text-slate-800 dark:text-white">Hasan</span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold">&rarr;</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Rafi</span>
                  <span className="font-bold ml-auto text-amber-600 dark:text-amber-400">৳3,500.00</span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold font-sans">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL ENGINE CORE VALUE PROPOSITION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Two Worlds. One Flawless Platform.
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Engineered for both your personal wealth and your shared living costs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Finance Column */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-7 sm:p-8 space-y-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                1. Personal Finance Mastery
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Take complete ownership of your personal financial journey with real-time income tracking, category budgets, visual savings goals, and receipt archives.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-source income & expense ledger with custom tags</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Smart budget alert triggers when nearing 80% limit</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Savings goal projections with monthly recommended saving rate</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated insights comparing monthly trends</span>
              </li>
            </ul>
          </div>

          {/* Shared Mess / Family Column */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-7 sm:p-8 space-y-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                2. Shared Mess & Household System
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Designed specifically for bachelor messes, student apartments, roommates, and joint families to track utilities, rent, groceries, and debt settlements.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>4 splitting methods: Equal, Exact, Percentage, and Shares</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Smart Debt Simplification: minimizes transaction hops</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Recurring bills management with due date reminder tags</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Collaborative grocery list with 1-click expense conversion</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. EXPENSE SPLITTING EXPLAINER */}
      <section className="bg-slate-50/80 dark:bg-[#070a10] py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-10">
            <Badge variant="brand">Splitting Engine</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Every expense scenario, covered with precision.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
              Whether you are splitting flat rent equally or dividing grocery based on room share or meal consumption:
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            {/* Split Method Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              {[
                { id: 'EQUAL', label: '1. Equal Split' },
                { id: 'EXACT', label: '2. Exact Split' },
                { id: 'PERCENTAGE', label: '3. Percentage Split' },
                { id: 'SHARES', label: '4. Share-Based Split' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveSplitTab(t.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activeSplitTab === t.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Explainer Content */}
            <div className="space-y-4">
              {activeSplitTab === 'EQUAL' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Equal Split Example:</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                    Total Expense = <span className="font-bold text-slate-900 dark:text-white">৳4,000</span> across 4 members (Rafi, Rahim, Karim, Hasan).
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {['Rafi', 'Rahim', 'Karim', 'Hasan'].map((m) => (
                      <div key={m} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center border border-slate-200 dark:border-slate-800 font-mono text-xs">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{m}</div>
                        <div className="text-brand-600 dark:text-brand-400 font-bold mt-1">৳1,000.00</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSplitTab === 'EXACT' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Exact Amount Split Example:</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                    When members purchase differing quantities. Strict backend validation verifies exact total matches sum of components.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { name: 'Member A', amt: '৳1,500.00' },
                      { name: 'Member B', amt: '৳1,000.00' },
                      { name: 'Member C', amt: '৳1,000.00' },
                      { name: 'Member D', amt: '৳500.00' },
                    ].map((item) => (
                      <div key={item.name} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center border border-slate-200 dark:border-slate-800 font-mono text-xs">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{item.name}</div>
                        <div className="text-brand-600 dark:text-brand-400 font-bold mt-1">{item.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSplitTab === 'PERCENTAGE' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Percentage Split Example:</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                    Percentages must equal 100%. Total = ৳10,000.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { name: 'Member A (40%)', amt: '৳4,000.00' },
                      { name: 'Member B (30%)', amt: '৳3,000.00' },
                      { name: 'Member C (20%)', amt: '৳2,000.00' },
                      { name: 'Member D (10%)', amt: '৳1,000.00' },
                    ].map((item) => (
                      <div key={item.name} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center border border-slate-200 dark:border-slate-800 font-mono text-xs">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{item.name}</div>
                        <div className="text-brand-600 dark:text-brand-400 font-bold mt-1">{item.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSplitTab === 'SHARES' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Share-Based Split Example:</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                    Roommate A has master bedroom (2 shares), while B and C have single rooms (1 share each). Total 4 shares.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { name: 'Member A (2 shares)', amt: '50% of cost' },
                      { name: 'Member B (1 share)', amt: '25% of cost' },
                      { name: 'Member C (1 share)', amt: '25% of cost' },
                    ].map((item) => (
                      <div key={item.name} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center border border-slate-200 dark:border-slate-800 font-mono text-xs">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{item.name}</div>
                        <div className="text-brand-600 dark:text-brand-400 font-bold mt-1">{item.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500">
            Have questions about FINNEST? Here is how everything works under the hood.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-4 sm:p-5 text-left text-sm font-bold flex items-center justify-between text-slate-900 dark:text-white hover:text-brand-600 transition-colors"
              >
                <span className="pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${activeFaq === i ? 'rotate-180 text-brand-600' : 'text-slate-400'}`} />
              </button>
              {activeFaq === i && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. COMPACT CALL TO ACTION BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white shadow-xl shadow-brand-500/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-semibold backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Smart Financial Control</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Take complete control of your finances today.
            </h3>
            <p className="text-brand-100 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
              Join thousands of users tracking wealth and sharing mess expenses with zero stress and zero mathematical errors.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
            <Link to="/register">
              <Button variant="secondary" size="md" className="bg-white text-brand-700 hover:bg-slate-100 font-bold px-5 py-2.5 shadow-md text-xs sm:text-sm">
                Create Your Free Account Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};


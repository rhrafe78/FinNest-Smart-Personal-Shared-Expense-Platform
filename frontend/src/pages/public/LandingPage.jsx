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
        {/* Ambient multi-color background glow for rich vibrancy */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-brand-400/25 via-purple-400/20 to-emerald-400/25 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-brand-900 bg-indigo-50/90 dark:bg-brand-950/60 text-xs font-bold text-indigo-800 dark:text-brand-300 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Smart Personal & Shared Expense Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Manage your money.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 dark:from-brand-500 dark:via-indigo-400 dark:to-emerald-400">
              Share expenses. Stay in control.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            The dual-engine fintech SaaS built for individuals, bachelor messes, roommates, and families. Track wealth, budget accurately, and simplify group debt effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link to="/app/dashboard">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-xl shadow-brand-500/25 font-bold">
                  Launch FinNest Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-xl shadow-brand-500/25 font-bold">
                    Start Managing Your Money <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-7 py-3.5 font-bold border-slate-300 text-slate-800 hover:bg-slate-100">
                    Sign In to Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-600" /> Bank-grade Decimal Math</span>
            <span className="flex items-center gap-1.5"><Users2 className="w-4 h-4 text-brand-600" /> Unlimited Households</span>
          </div>
        </div>

        {/* 2. PRODUCT DASHBOARD PREVIEW MOCKUP */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 sm:mt-20">
          <div className="relative rounded-3xl border-2 border-indigo-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-indigo-500/15 ring-4 ring-indigo-500/5">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
                <span className="ml-3 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold border border-slate-200/60 dark:border-slate-700">
                  finnest.app/dashboard
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 rounded-full font-bold shadow-sm">
                  ● Live System Connected
                </span>
              </div>
            </div>

            {/* Dashboard Inner Grid Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-100/90 via-indigo-50/50 to-white dark:bg-slate-900/60 border-2 border-indigo-200 dark:border-indigo-900/50 shadow-md shadow-indigo-500/5 hover:border-indigo-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-indigo-950 dark:text-slate-300 font-extrabold uppercase tracking-wider">Total Balance</span>
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shadow-sm font-bold shrink-0">৳</span>
                  </div>
                  <div className="text-2xl font-black text-indigo-950 dark:text-white tracking-tight">৳ 127,000.00</div>
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-extrabold mt-3 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" /> +14.2% this month
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-100/90 via-emerald-50/50 to-white dark:bg-slate-900/60 border-2 border-emerald-200 dark:border-emerald-900/50 shadow-md shadow-emerald-500/5 hover:border-emerald-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-emerald-950 dark:text-slate-300 font-extrabold uppercase tracking-wider">Green View Mess Net</span>
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm font-bold shrink-0">
                      <Building className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">+৳ 16,800.00</div>
                </div>
                <div className="text-xs text-emerald-900 dark:text-slate-300 mt-3 font-bold">3 roommates owe you</div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-100/90 via-amber-50/50 to-white dark:bg-slate-900/60 border-2 border-amber-200 dark:border-amber-900/50 shadow-md shadow-amber-500/5 hover:border-amber-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-amber-950 dark:text-slate-300 font-extrabold uppercase tracking-wider">Food Budget Used</span>
                    <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs shadow-sm font-bold shrink-0">
                      <PieChart className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-950 dark:text-white tracking-tight">57.5%</div>
                </div>
                <div className="text-xs text-amber-900 dark:text-brand-400 font-extrabold mt-3">৳5,100 left of ৳12,000</div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-100/90 via-sky-50/50 to-white dark:bg-slate-900/60 border-2 border-sky-200 dark:border-sky-900/50 shadow-md shadow-sky-500/5 hover:border-sky-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-sky-950 dark:text-slate-300 font-extrabold uppercase tracking-wider">MacBook Pro Goal</span>
                    <span className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center text-xs shadow-sm font-bold shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-sky-800 dark:text-cyan-400 tracking-tight">69.6%</div>
                </div>
                <div className="text-xs text-sky-950 dark:text-slate-300 mt-3 font-bold">৳195,000 of ৳280,000</div>
              </div>
            </div>

            {/* Split & Debt Simplification Visualizer Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-violet-100/80 via-indigo-50/70 to-purple-100/80 dark:bg-slate-900/80 border-2 border-indigo-200/90 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 text-left">
                <Badge variant="brand">Smart Debt Simplification Active</Badge>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Green View Mess — 4 Roommates, 1 Optimal Settlement Plan
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-400 max-w-md font-medium">
                  6 complex shared expenses (Rent, Wi-Fi, Electricity, Grocery, Maid) mathematically resolved into minimum direct transactions.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 w-full md:w-auto">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-slate-700 text-xs font-mono shadow-sm">
                  <span className="font-extrabold text-slate-900 dark:text-slate-200">Karim</span>
                  <span className="text-brand-600 font-black">&rarr;</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">Rafi</span>
                  <span className="font-black ml-auto text-emerald-700 dark:text-emerald-400">৳2,000.00</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold font-sans">Settled</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-slate-700 text-xs font-mono shadow-sm">
                  <span className="font-extrabold text-slate-900 dark:text-slate-200">Hasan</span>
                  <span className="text-brand-600 font-black">&rarr;</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">Rafi</span>
                  <span className="font-black ml-auto text-amber-700 dark:text-amber-400">৳3,500.00</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold font-sans">Pending</span>
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
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-slate-800 bg-gradient-to-b from-emerald-100/70 via-emerald-50/40 to-white dark:bg-[#111827] p-8 space-y-6 shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:border-emerald-400 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                1. Personal Finance Mastery
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed font-normal">
                Take complete ownership of your personal financial journey with real-time income tracking, category budgets, visual savings goals, and receipt archives.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-800 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-emerald-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Multi-source income & expense ledger with custom tags</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-emerald-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Smart budget alert triggers when nearing 80% limit</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-emerald-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Savings goal projections with monthly recommended saving rate</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-emerald-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Automated AI-like financial insights comparing monthly trends</span>
              </li>
            </ul>
          </div>

          {/* Shared Mess / Family Column */}
          <div className="rounded-3xl border-2 border-indigo-300 dark:border-slate-800 bg-gradient-to-b from-indigo-100/70 via-indigo-50/40 to-white dark:bg-[#111827] p-8 space-y-6 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:border-indigo-400 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-brand-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                2. Shared Mess & Household System
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed font-normal">
                Designed specifically for bachelor messes, student apartments, roommates, and joint families to track utilities, rent, groceries, and debt settlements.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-800 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-indigo-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                <span>4 splitting methods: Equal, Exact, Percentage, and Shares</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-indigo-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                <span>Smart Debt Simplification: minimizes transaction hops</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-indigo-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                <span>Recurring bills management with due date reminder tags</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-indigo-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                <span>Collaborative grocery list with 1-click expense conversion</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. EXPENSE SPLITTING EXPLAINER */}
      <section className="bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-slate-50/80 dark:bg-[#070a10] py-20 border-y-2 border-indigo-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="brand">Splitting Engine</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Every expense scenario, covered with precision.
            </h2>
            <p className="text-slate-700 dark:text-slate-400 text-sm max-w-xl mx-auto font-medium">
              Whether you are splitting flat rent equally or dividing grocery based on room share or meal consumption:
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-3xl border-2 border-indigo-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xl shadow-indigo-500/10">
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
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeSplitTab === t.id
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-200'
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
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Equal Split Example:</h4>
                  <p className="text-slate-700 dark:text-slate-400">
                    Total Expense = <span className="font-bold text-slate-900 dark:text-white">৳4,000</span> across 4 members (Rafi, Rahim, Karim, Hasan).
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {['Rafi', 'Rahim', 'Karim', 'Hasan'].map((m) => (
                      <div key={m} className="p-3.5 bg-gradient-to-b from-indigo-100/70 to-white dark:bg-slate-900 rounded-xl text-center border-2 border-indigo-200 dark:border-slate-800 font-mono text-xs shadow-sm hover:border-indigo-400 transition-all">
                        <div className="font-bold text-slate-800 dark:text-slate-300">{m}</div>
                        <div className="text-indigo-700 dark:text-brand-400 font-extrabold mt-1">৳1,000.00</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSplitTab === 'EXACT' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Exact Amount Split Example:</h4>
                  <p className="text-slate-700 dark:text-slate-400">
                    When members purchase differing quantities. Strict backend validation verifies exact total matches sum of components.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { name: 'Member A', amt: '৳1,500.00' },
                      { name: 'Member B', amt: '৳1,000.00' },
                      { name: 'Member C', amt: '৳1,000.00' },
                      { name: 'Member D', amt: '৳500.00' },
                    ].map((item) => (
                      <div key={item.name} className="p-3.5 bg-gradient-to-b from-emerald-100/70 to-white dark:bg-slate-900 rounded-xl text-center border-2 border-emerald-200 dark:border-slate-800 font-mono text-xs shadow-sm hover:border-emerald-400 transition-all">
                        <div className="font-bold text-slate-800 dark:text-slate-300">{item.name}</div>
                        <div className="text-emerald-700 dark:text-brand-400 font-extrabold mt-1">{item.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSplitTab === 'PERCENTAGE' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Percentage Split Example:</h4>
                  <p className="text-slate-700 dark:text-slate-400">
                    Percentages must equal 100%. Total = ৳10,000.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { name: 'Member A (40%)', amt: '৳4,000.00' },
                      { name: 'Member B (30%)', amt: '৳3,000.00' },
                      { name: 'Member C (20%)', amt: '৳2,000.00' },
                      { name: 'Member D (10%)', amt: '৳1,000.00' },
                    ].map((item) => (
                      <div key={item.name} className="p-3.5 bg-gradient-to-b from-amber-100/70 to-white dark:bg-slate-900 rounded-xl text-center border-2 border-amber-200 dark:border-slate-800 font-mono text-xs shadow-sm hover:border-amber-400 transition-all">
                        <div className="font-bold text-slate-800 dark:text-slate-300">{item.name}</div>
                        <div className="text-amber-800 dark:text-brand-400 font-extrabold mt-1">{item.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSplitTab === 'SHARES' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Share-Based Split Example:</h4>
                  <p className="text-slate-700 dark:text-slate-400">
                    Roommate A has master bedroom (2 shares), while B and C have single rooms (1 share each). Total 4 shares.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { name: 'Member A (2 shares)', amt: '50% of cost' },
                      { name: 'Member B (1 share)', amt: '25% of cost' },
                      { name: 'Member C (1 share)', amt: '25% of cost' },
                    ].map((item) => (
                      <div key={item.name} className="p-3.5 bg-gradient-to-b from-purple-100/70 to-white dark:bg-slate-900 rounded-xl text-center border-2 border-purple-200 dark:border-slate-800 font-mono text-xs shadow-sm hover:border-purple-400 transition-all">
                        <div className="font-bold text-slate-800 dark:text-slate-300">{item.name}</div>
                        <div className="text-purple-700 dark:text-brand-400 font-extrabold mt-1">{item.amt}</div>
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
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500">
            Have questions about FINNEST? Here is how everything works under the hood.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border-2 transition-all overflow-hidden ${
                activeFaq === i
                  ? 'border-indigo-400 bg-white dark:bg-[#111827] shadow-lg shadow-indigo-500/5'
                  : 'border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#111827] hover:border-indigo-300 shadow-sm'
              }`}
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className={`w-full p-5 text-left text-sm font-bold flex items-center justify-between transition-colors ${
                  activeFaq === i ? 'text-indigo-600 dark:text-brand-400 bg-indigo-50/40 dark:bg-slate-800/30' : 'text-slate-900 dark:text-white hover:text-indigo-600'
                }`}
              >
                <span className="pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${activeFaq === i ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-indigo-100 dark:border-slate-800/80 pt-3.5 bg-gradient-to-b from-indigo-50/20 to-white dark:bg-transparent">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

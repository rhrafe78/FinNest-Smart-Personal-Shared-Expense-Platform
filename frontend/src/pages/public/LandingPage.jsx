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
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-900 bg-brand-50/80 dark:bg-brand-950/60 text-xs font-semibold text-brand-700 dark:text-brand-300 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Smart Personal & Shared Expense Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Manage your money.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-500">
              Share expenses. Stay in control.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The dual-engine fintech SaaS built for individuals, bachelor messes, roommates, and families. Track wealth, budget accurately, and simplify group debt effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link to="/app/dashboard">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-xl shadow-brand-500/25">
                  Launch FinNest Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-xl shadow-brand-500/25">
                    Start Managing Your Money <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-7 py-3.5">
                    Sign In to Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Bank-grade Decimal Math</span>
            <span className="flex items-center gap-1.5"><Users2 className="w-4 h-4 text-brand-500" /> Unlimited Households</span>
          </div>
        </div>

        {/* 2. PRODUCT DASHBOARD PREVIEW MOCKUP */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 sm:mt-20">
          <div className="relative rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#111827]/80 backdrop-blur-xl p-3 sm:p-5 shadow-2xl shadow-slate-900/10 dark:shadow-brand-950/40">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">finnest.app/dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">
                  Live System Connected
                </span>
              </div>
            </div>

            {/* Dashboard Inner Grid Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-semibold uppercase">Total Balance</div>
                <div className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">৳ 127,000.00</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">+14.2% this month</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-semibold uppercase">Green View Mess Net</div>
                <div className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">+৳ 16,800.00</div>
                <div className="text-xs text-slate-400 mt-1">3 roommates owe you</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-semibold uppercase">Food Budget Used</div>
                <div className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">57.5%</div>
                <div className="text-xs text-brand-600 font-medium mt-1">৳5,100 left of ৳12,000</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-semibold uppercase">MacBook Pro Goal</div>
                <div className="text-2xl font-extrabold mt-1 text-cyan-600 dark:text-cyan-400">69.6%</div>
                <div className="text-xs text-slate-400 mt-1">৳195,000 of ৳280,000</div>
              </div>
            </div>

            {/* Split & Debt Simplification Visualizer Card */}
            <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-left">
                <Badge variant="brand">Smart Debt Simplification Active</Badge>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Green View Mess — 4 Roommates, 1 Optimal Settlement Plan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  6 complex shared expenses (Rent, Wi-Fi, Electricity, Grocery, Maid) mathematically resolved into minimum direct transactions.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Karim</span>
                  <span className="text-brand-500">&rarr;</span>
                  <span className="font-bold text-emerald-600">Rafi</span>
                  <span className="font-bold ml-auto text-emerald-600">৳2,000.00</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans">Settled</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Hasan</span>
                  <span className="text-brand-500">&rarr;</span>
                  <span className="font-bold text-emerald-600">Rafi</span>
                  <span className="font-bold ml-auto text-amber-500">৳3,500.00</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-sans">Pending</span>
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
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 space-y-6 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                1. Personal Finance Mastery
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Take complete ownership of your personal financial journey with real-time income tracking, category budgets, visual savings goals, and receipt archives.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Multi-source income & expense ledger with custom tags</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Smart budget alert triggers when nearing 80% limit</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Savings goal projections with monthly recommended saving rate</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Automated AI-like financial insights comparing monthly trends</span>
              </li>
            </ul>
          </div>

          {/* Shared Mess / Family Column */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 space-y-6 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                2. Shared Mess & Household System
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Designed specifically for bachelor messes, student apartments, roommates, and joint families to track utilities, rent, groceries, and debt settlements.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                <span>4 splitting methods: Equal, Exact, Percentage, and Shares</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                <span>Smart Debt Simplification: minimizes transaction hops</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                <span>Recurring bills management with due date reminder tags</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                <span>Collaborative grocery list with 1-click expense conversion</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. EXPENSE SPLITTING EXPLAINER */}
      <section className="bg-slate-100/60 dark:bg-[#070a10] py-20 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="brand">Splitting Engine</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Every expense scenario, covered with precision.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
              Whether you are splitting flat rent equally or dividing grocery based on room share or meal consumption:
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md">
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeSplitTab === t.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
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
                  <p className="text-slate-600 dark:text-slate-400">
                    Total Expense = <span className="font-bold text-slate-900 dark:text-white">৳4,000</span> across 4 members (Rafi, Rahim, Karim, Hasan).
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {['Rafi', 'Rahim', 'Karim', 'Hasan'].map((m) => (
                      <div key={m} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center border border-slate-200 dark:border-slate-800 font-mono text-xs">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{m}</div>
                        <div className="text-brand-600 dark:text-brand-400 font-bold mt-1">৳1,000.00</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSplitTab === 'EXACT' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Exact Amount Split Example:</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    When members purchase differing quantities. Strict backend validation verifies exact total matches sum of components.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { name: 'Member A', amt: '৳1,500.00' },
                      { name: 'Member B', amt: '৳1,000.00' },
                      { name: 'Member C', amt: '৳1,000.00' },
                      { name: 'Member D', amt: '৳500.00' },
                    ].map((item) => (
                      <div key={item.name} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center border border-slate-200 dark:border-slate-800 font-mono text-xs">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{item.name}</div>
                        <div className="text-brand-600 dark:text-brand-400 font-bold mt-1">{item.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSplitTab === 'PERCENTAGE' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Percentage Split Example:</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Percentages must equal 100%. Total = ৳10,000.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { name: 'Member A (40%)', amt: '৳4,000.00' },
                      { name: 'Member B (30%)', amt: '৳3,000.00' },
                      { name: 'Member C (20%)', amt: '৳2,000.00' },
                      { name: 'Member D (10%)', amt: '৳1,000.00' },
                    ].map((item) => (
                      <div key={item.name} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center border border-slate-200 dark:border-slate-800 font-mono text-xs">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{item.name}</div>
                        <div className="text-brand-600 dark:text-brand-400 font-bold mt-1">{item.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSplitTab === 'SHARES' && (
                <div className="space-y-3 text-sm">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Share-Based Split Example:</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Roommate A has master bedroom (2 shares), while B and C have single rooms (1 share each). Total 4 shares.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { name: 'Member A (2 shares)', amt: '50% of cost' },
                      { name: 'Member B (1 share)', amt: '25% of cost' },
                      { name: 'Member C (1 share)', amt: '25% of cost' },
                    ].map((item) => (
                      <div key={item.name} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center border border-slate-200 dark:border-slate-800 font-mono text-xs">
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
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
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
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-5 text-left text-sm font-bold flex items-center justify-between text-slate-900 dark:text-white hover:text-brand-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white p-8 sm:p-14 text-center space-y-6 shadow-2xl shadow-brand-500/20">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Take complete control of your finances today.
          </h2>
          <p className="text-brand-100 text-sm sm:text-base max-w-xl mx-auto">
            Join thousands of users tracking wealth and sharing mess expenses with zero stress and zero mathematical errors.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-slate-100 font-bold px-8 py-3.5">
                Create Your Free Account Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

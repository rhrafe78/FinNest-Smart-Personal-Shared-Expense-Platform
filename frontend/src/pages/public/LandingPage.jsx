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

  const memberNames = ['আপনি (রাফি)', 'তানভীর', 'আরিফ', 'সাকিব', 'ফাহিম', 'ইমরান'];
  const activeMembers = memberNames.slice(0, demoMembers);
  const perPersonShare = demoAmount > 0 ? (demoAmount / demoMembers) : 0;
  const youReceiveTotal = demoAmount - perPersonShare;

  const faqs = [
    {
      q: 'FinNest কি আমার ব্যক্তিগত খরচ আর মেসের হিসাব আলাদা রাখে?',
      a: 'হ্যাঁ, সম্পূর্ণ আলাদা। আপনার ব্যক্তিগত স্যালারি ও পকেট খরচ থাকবে ১০০% প্রাইভেট। কেবল মেসের জন্য শেয়ার করা বিলটুকুই মেস সদস্যরা দেখতে পাবে।'
    },
    {
      q: 'মেসে রুমমেটদের মধ্যে খরচ কীভাবে ভাগ হয়?',
      a: 'সমান ভাগ (Equal Split), মিল বা কাস্টম টাকার ভাগ (Exact Split), এবং রুম শেয়ার অনুযায়ী ভাগ—সব পদ্ধতিই এক ক্লিকে ব্যবহার করা যায়।'
    },
    {
      q: 'স্মার্ট ঋণ নিষ্পত্তি (Debt Simplification) কীভাবে কাজ করে?',
      a: 'রুমমেটরা একে অপরকে একাধিকবার টাকা না পাঠিয়ে সরাসরি নেট ব্যালেন্স বের করে মাত্র ১টি বা ২টি ট্রান্সফারে পুরো মেসের দেনা-পাওনা ক্লিয়ার করে।'
    },
    {
      q: 'FinNest কি সম্পূর্ণ ফ্রি?',
      a: 'হ্যাঁ! ব্যক্তিগত খরচ ট্র্যাকিং এবং মেসের শেয়ার্ড হিসাব পরিচালনা করার সকল মূল ফিচার সম্পূর্ণ ফ্রিতে ব্যবহার করা যায়।'
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* 1. HERO SECTION (Airy, Spacious, Human) */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-sm text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
            <span>স্মার্ট ব্যক্তিগত ওয়ালেট ও মেস ম্যানেজমেন্ট</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            ব্যক্তিগত খরচ আর মেসের খাতা —<br />
            <span className="text-brand-600 dark:text-brand-400">
              সব এক জায়গায়, পরিচ্ছন্ন ও স্বচ্ছ।
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            মেসের বাজার, রুমমেটদের মিল, ফ্ল্যাট ভাড়া ও বিদ্যুৎ বিলের নির্ভুল হিসাব রাখুন। কোনো ভুল বোঝাবুঝি বা ক্যালকুলেটরের মারপ্যাঁচ ছাড়াই।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            {isAuthenticated ? (
              <Link to="/app/dashboard">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm font-semibold px-8 py-3.5 shadow-sm shadow-brand-500/20">
                  ড্যাশবোর্ডে যান <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm font-semibold px-8 py-3.5 shadow-sm shadow-brand-500/20">
                    ফ্রি অ্যাকাউন্ট খুলুন <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-semibold px-8 py-3.5">
                    লগইন করুন
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> ১০০% প্রাইভেট ও নিরাপদ</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> তাৎক্ষণিক নিষ্পত্তি</span>
            <span className="flex items-center gap-2"><Users2 className="w-4 h-4 text-brand-500" /> যেকোনো সংখ্যক রুমমেট</span>
          </div>
        </div>

        {/* 2. INTERACTIVE SPLIT PLAYGROUND (Clean, Spacious, Human) */}
        <div className="max-w-4xl mx-auto px-6 mt-16 sm:mt-24">
          <div className="fin-card p-6 sm:p-10 space-y-8 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  লাইভ হিসাব ভাগ পরীক্ষা করুন
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  টাকার অংক ও সদস্য সংখ্যা পরিবর্তন করে দেখুন কীভাবে হিসাব ক্লিয়ার হয়।
                </p>
              </div>
              <Badge variant="brand" className="self-start sm:self-auto text-xs py-1 px-3">
                ইন্টারেক্টিভ প্রিভিউ
              </Badge>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  মোট খরচ (৳)
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
                  মেস সদস্য সংখ্যা ({demoMembers} জন)
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
                      {count} জন
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 pt-1">পকেট থেকে টাকা দিয়েছেন: <strong>আপনি (রাফি)</strong></p>
              </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  প্রতি রুমমেটের ভাগে পড়ে
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  ৳{perPersonShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  মোট ৳{demoAmount.toLocaleString()} সমান {demoMembers} ভাগে ভাগ
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  মেস থেকে আপনি ফেরত পাবেন
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  +৳{youReceiveTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 pt-1">
                  বাকি {demoMembers - 1} জন সদস্য প্রত্যেকে আপনাকে ৳{perPersonShare.toFixed(0)} দেবেন
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
            বাস্তব জীবনের হিসাব
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            সব ধরনের আর্থিক হিসাবের এক সহজ ঠিকানা
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ব্যাচেলর মেস, রুমমেট কিংবা নিজের ব্যক্তিগত পকেট খরচের নির্ভরযোগ্য সঙ্গী
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
                মেস ও রুমমেট হিসাব
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                ফ্ল্যাট ভাড়া, বুয়ার বেতন, ওয়াই-ফাই ও কাঁচাবাজারের খরচ নিয়ে মাস শেষে আর কোনো তর্ক বা ভুল বোঝাবুঝি থাকবে না।
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
                ব্যক্তিগত মাসিক বাজেট
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                মাস শেষে টাকা কোথায় গেল তা আর ভাবতে হবে না। বেতন ও দৈনিক খরচের হিসাব চোখের সামনে স্পষ্ট রাখুন।
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
                স্বয়ংক্রিয় দেনা নিষ্পত্তি
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                কে কাকে কত টাকা দেবে তা অ্যালগরিদম স্বয়ংক্রিয়ভাবে বের করে মাত্র ১ বা ২টি ট্রান্সফারে মেসের হিসাব ক্লিয়ার করে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION (Spacious & Calm) */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            সাধারণ কিছু জিজ্ঞাসা
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            FinNest কীভাবে কাজ করে সে সম্পর্কে জেনে নিন
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
              আজই শুরু করুন পরিচ্ছন্ন আর্থিক হিসাব
            </h3>
            <p className="text-brand-100 text-xs sm:text-sm max-w-md">
              কোনো ঝামেলা ছাড়াই আপনার পকেট খরচ ও মেসের খাতা একসাথে নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="shrink-0">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-slate-100 font-bold px-7 py-3 text-xs shadow-sm">
                ফ্রি অ্যাকাউন্ট তৈরি করুন
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

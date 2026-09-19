import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Users,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Edit3,
  Target,
  Calendar,
  Home,
  ShoppingBag,
  Pill,
  Zap,
  Utensils,
  Bus,
  RefreshCw,
  Flame,
  Wifi,
  Droplets,
  Brush,
  Edit2,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { AddExpenseModal } from '../../components/modals/AddExpenseModal';
import { AddIncomeModal } from '../../components/modals/AddIncomeModal';
import { AddSharedExpenseModal } from '../../components/modals/AddSharedExpenseModal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(() => {
    try {
      const cached = sessionStorage.getItem('finnest_dashboard_cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Modals state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showSharedModal, setShowSharedModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editExpenseItem, setEditExpenseItem] = useState(null);
  const [editIncomeItem, setEditIncomeItem] = useState(null);

  // Quick settings modal state
  const [salaryInput, setSalaryInput] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, type, title }
  const [deleting, setDeleting] = useState(false);

  const handleEditExpense = (item) => {
    setEditExpenseItem(item);
    setShowExpenseModal(true);
  };

  const handleEditIncome = (item) => {
    setEditIncomeItem(item);
    setShowIncomeModal(true);
  };

  const handleEditRecent = (tx) => {
    if (tx.type === 'income') {
      handleEditIncome(tx);
    } else {
      handleEditExpense(tx);
    }
  };

  const handleDeleteItem = (id, type, title = '') => {
    setDeleteTarget({ id, type, title });
  };

  const confirmDeleteItem = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'income') {
        await api.delete(`/personal/incomes/${deleteTarget.id}/`);
      } else {
        await api.delete(`/personal/expenses/${deleteTarget.id}/`);
      }
      setDeleteTarget(null);
      fetchDashboardData();
    } catch (err) {
      alert('মুছে ফেলতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setDeleting(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const dashRes = await api.get('/analytics/dashboard/');
      setData(dashRes.data);
      try {
        sessionStorage.setItem('finnest_dashboard_cache', JSON.stringify(dashRes.data));
      } catch (e) {}
      if (dashRes.data?.salary_breakdown) {
        setSalaryInput(dashRes.data.salary_breakdown.monthly_salary || '0');
      }
      if (dashRes.data?.daily_tracker) {
        setTargetInput(dashRes.data.daily_tracker.daily_target || '500');
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setFetchError('ড্যাশবোর্ড ডেটা লোড হতে সমস্যা হয়েছে। সার্ভার সংযোগ পরীক্ষা করুন।');
    }

    try {
      const insightsRes = await api.get('/analytics/insights/');
      setInsights(insightsRes.data);
    } catch (err) {
      console.warn('Failed to load insights:', err);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.patch('/auth/me/', {
        monthly_income: salaryInput,
        daily_target: targetInput,
      });
      setShowSettingsModal(false);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update salary or daily target.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (fetchError && !data) {
    return (
      <div className="py-16 px-4 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">ডেটা লোড করা যায়নি</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{fetchError}</p>
        <Button variant="primary" onClick={fetchDashboardData} icon={RefreshCw} className="mx-auto font-bold">
          পুনরায় চেষ্টা করুন (Retry)
        </Button>
      </div>
    );
  }

  const safeData = data || {
    currency: 'BDT',
    daily_tracker: {
      today_expense: '0.00',
      daily_target: '500.00',
      difference: '500.00',
      is_profit: true,
      expenses_list: [],
      count: 0
    },
    salary_breakdown: {
      monthly_salary: '0.00',
      effective_income: '0.00',
      total_spent_this_month: '0.00',
      remaining_salary: '0.00',
      spent_pct: 0.0,
      is_overspent: false,
      categories: {}
    },
    shared_summary: {
      active_households: 0,
      you_owe: '0.00',
      others_owe_you: '0.00',
      pending_settlements: 0,
      upcoming_bills: 0
    },
    recent_transactions: []
  };

  const curr = safeData.currency === 'BDT' ? '৳' : safeData.currency === 'USD' ? '$' : '৳';
  const daily = safeData.daily_tracker;
  const salary = safeData.salary_breakdown;
  const shared = safeData.shared_summary;

  const remainingNum = parseFloat(salary.remaining_salary || '0');
  const salaryNum = parseFloat(salary.effective_income || '0');
  const spentPct = salary.spent_pct || 0;

  const [activeTxTab, setActiveTxTab] = useState('all'); // 'all' | 'today'

  const handleQuickExpense = (merchant, defaultAmount) => {
    setEditExpenseItem({
      merchant,
      amount: defaultAmount,
      date: new Date().toISOString().split('T')[0],
    });
    setShowExpenseModal(true);
  };

  return (
    <div className="space-y-8 sm:space-y-10 max-w-5xl mx-auto">
      {/* 1. Natural, Frameless Header (Spacious & Clean) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 animate-fade-in">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
            <span>{daily.today_date_formatted || 'আজকের দিন'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            স্বাগতম, {user?.first_name || user?.username || 'ইউজার'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            আপনার আজকের আর্থিক অবস্থা ও মেসের হিসাব এক নজরে
          </p>
        </div>

        {/* Clean, Tactile Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setEditExpenseItem(null);
              setShowExpenseModal(true);
            }}
            className="text-xs font-semibold px-4 py-2.5 shadow-sm"
          >
            খরচ লিখুন
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={Home}
            onClick={() => setShowSharedModal(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 px-4 py-2.5"
          >
            মেসের খরচ
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={TrendingUp}
            onClick={() => {
              setEditIncomeItem(null);
              setShowIncomeModal(true);
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-2.5"
          >
            আয় যোগ
          </Button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title="মাসিক স্যালারি ও দৈনিক টার্গেট পরিবর্তন"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Hero Cash Balance Card (Generous Whitespace & Calm Elegance) */}
      <div className={`p-6 sm:p-8 rounded-3xl border bg-white dark:bg-[#0f172a] shadow-subtle hover:shadow-card transition-all duration-200 animate-fade-in-delayed ${
        salary.is_overspent
          ? 'border-rose-300 dark:border-rose-900/50'
          : 'border-slate-200/90 dark:border-slate-800/80'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            চলতি মাসে হাতে অবশিষ্ট ব্যালেন্স
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            salary.is_overspent
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${salary.is_overspent ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span>{salary.is_overspent ? 'বাজেট শেষ / ঘাটতি' : 'ব্যালেন্স নিরাপদ'}</span>
          </span>
        </div>

        {/* Big Tabular Number */}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-medium text-slate-400 dark:text-slate-500">{curr}</span>
          <span className={`text-3xl sm:text-5xl font-bold tracking-tight font-mono tabular-nums ${
            salary.is_overspent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
          }`}>
            {Math.abs(remainingNum).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Slender Animated Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                salary.is_overspent ? 'bg-rose-500' : spentPct > 80 ? 'bg-amber-500' : 'bg-brand-600'
              }`}
              style={{ width: `${Math.min(spentPct, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
            <span>মাসিক বেতন: <strong className="text-slate-700 dark:text-slate-300 font-mono font-semibold">{curr} {parseFloat(salary.monthly_salary || '0').toLocaleString()}</strong></span>
            <span>মোট খরচ: <strong className="text-rose-600 dark:text-rose-400 font-mono font-semibold">{curr} {parseFloat(salary.total_spent_this_month || '0').toLocaleString()}</strong> ({spentPct.toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* 3. Sleek 1-Tap Quick Logger Chips (Effortless Daily Entry) */}
      <div className="space-y-2.5 animate-fade-in-delayed">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>১-ট্যাপে দ্রুত খরচ এন্ট্রি:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {[
            { label: 'চা ও নাস্তা', amount: '40', icon: '☕' },
            { label: 'দুপুরের খাবার', amount: '130', icon: '🍛' },
            { label: 'রিকশা / ভাড়া', amount: '50', icon: '🛺' },
            { label: 'বাজার খরচ', amount: '350', icon: '🛒' },
            { label: 'ওষুধ', amount: '120', icon: '💊' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleQuickExpense(preset.label, preset.amount)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800/80 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 hover:shadow-subtle hover:-translate-y-0.5 active:scale-95 transition-all duration-150"
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
              <span className="font-mono font-semibold text-slate-400 dark:text-slate-500">৳{preset.amount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Two Spacious Companion Cards (Airy 2-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 animate-fade-in-delayed-2">
        {/* Card A: Today's Spend */}
        <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-subtle hover:shadow-card transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              আজকের দিনের মোট খরচ
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              daily.is_profit
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
            }`}>
              {daily.is_profit ? 'সীমার মধ্যে আছে' : 'টার্গেট পার'}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-medium text-slate-400">{curr}</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums text-slate-900 dark:text-white">
              {parseFloat(daily.today_expense || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                daily.is_profit ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{
                width: `${Math.min(
                  (parseFloat(daily.today_expense || '0') / (parseFloat(daily.daily_target || '1') || 1)) * 100,
                  100
                )}%`,
              }}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>দৈনিক বাজেট: <strong className="text-slate-700 dark:text-slate-300 font-mono">{curr} {parseFloat(daily.daily_target || '0').toLocaleString()}</strong></span>
            <span className={`font-semibold ${daily.is_profit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {daily.is_profit ? `+৳${parseFloat(daily.difference || '0').toFixed(0)} বাকি` : `-৳${parseFloat(daily.difference || '0').toFixed(0)} অতিরিক্ত`}
            </span>
          </div>
        </div>

        {/* Card B: Shared Mess Status */}
        <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-subtle hover:shadow-card transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              মেস ও রুমমেট হিসাব
            </span>
            <Link to="/app/households" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1">
              মেস হাব <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-medium text-slate-400">{curr}</span>
            <span className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums ${
              parseFloat(shared.others_owe_you || '0') > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : parseFloat(shared.you_owe || '0') > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-800 dark:text-slate-200'
            }`}>
              {parseFloat(shared.others_owe_you || '0') > 0
                ? `+${parseFloat(shared.others_owe_you).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : parseFloat(shared.you_owe || '0') > 0
                ? `-${parseFloat(shared.you_owe).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : '0.00'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {parseFloat(shared.others_owe_you || '0') > 0
              ? '🎉 রুমমেটদের কাছে আপনার টাকা পাওনা আছে'
              : parseFloat(shared.you_owe || '0') > 0
              ? '⚠️ মেসের কাছে আপনার বকেয়া দেনা রয়েছে'
              : 'সব হিসাব পরিষ্কার (কোনো দেনা-পাওনা নেই)'}
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>সক্রিয় মেস: <strong className="text-slate-700 dark:text-slate-300">{shared.active_households || 0} টি</strong></span>
            <span>আসন্ন বিল: <strong className="text-slate-700 dark:text-slate-300">{shared.upcoming_bills || 0} টি</strong></span>
          </div>
        </div>
      </div>

      {/* 5. Unified, Clean Activity Feed (No Clutter, Single Calm Ledger) */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-subtle space-y-6 animate-fade-in-delayed-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              লেনদেনের খাতা
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">আপনার সাম্প্রতিক আয় ও খরচের তালিকা</p>
          </div>

          {/* Clean Segmented Tab Control */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTxTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTxTab === 'all'
                  ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              সব লেনদেন
            </button>
            <button
              type="button"
              onClick={() => setActiveTxTab('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTxTab === 'today'
                  ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              আজকের খরচ ({daily.count || 0})
            </button>
          </div>
        </div>

        {/* Transaction Rows Feed */}
        {activeTxTab === 'today' ? (
          daily.expenses_list && daily.expenses_list.length > 0 ? (
            <div className="space-y-2">
              {daily.expenses_list.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800 transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {item.merchant || item.title || 'খরচ'}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {item.category || 'সাধারণ'}
                        </span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm sm:text-base text-rose-600 dark:text-rose-400 tabular-nums">
                      -{curr} {parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditExpense(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, 'expense', item.merchant || item.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 text-center space-y-2">
              <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                আজকে এখনও কোনো খরচ করা হয়নি
              </p>
              <p className="text-xs text-slate-400">
                উপরের ১-ট্যাপ চিপস কিংবা "+ খরচ লিখুন" বোতামে চাপ দিয়ে লিখে ফেলুন।
              </p>
            </div>
          )
        ) : (
          safeData.recent_transactions && safeData.recent_transactions.length > 0 ? (
            <div className="space-y-2">
              {safeData.recent_transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800 transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {tx.title}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {tx.category}
                        </span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-sm sm:text-base tabular-nums ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{curr} {parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditRecent(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(tx.id, tx.type, tx.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 text-center space-y-2 text-slate-400">
              <Clock className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                এখনও কোনো লেনদেনের রেকর্ড নেই
              </p>
              <p className="text-xs text-slate-400">
                উপরে "+ খরচ লিখুন" বা "+ আয় যোগ" বোতাম চাপুন।
              </p>
            </div>
          )
        )}

        {/* View All History Link */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>মোট {data.recent_transactions?.length || 0} টি সাম্প্রতিক রেকর্ড</span>
          <Link
            to="/app/transactions"
            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            সম্পূর্ণ খরচের খাতা দেখুন <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* QUICK SETTINGS MODAL: Salary & Daily Target */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="মাসিক স্যালারি ও দৈনিক টার্গেট সেটিং"
      >
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              আপনার মূল মাসিক স্যালারি ({curr})
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 35000"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              এই স্যালারি থেকে প্রতিদিনের ও মাসের সব খরচ বাদ দিয়ে হাতে অবশিষ্ট ক্যাশ হিসাব হবে।
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              প্রতিদিনের খরচের বাজেট টার্গেট ({curr})
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 500"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              প্রতিদিন এই পরিমাণের মধ্যে খরচ রাখলে লাভ / সেভ দেখাবে, অতিরিক্ত হলে লস বা অ্যালার্ট দেখাবে।
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSalaryInput('0');
                setTargetInput('0');
              }}
              className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
            >
              সব ০ করুন (Reset to 0)
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSettingsModal(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={savingSettings}
                className="font-bold"
              >
                সংরক্ষণ করুন
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Global Modals */}
      <AddExpenseModal
        isOpen={showExpenseModal}
        editExpense={editExpenseItem}
        onClose={() => {
          setShowExpenseModal(false);
          setEditExpenseItem(null);
        }}
        onSuccess={() => fetchDashboardData()}
      />

      <AddIncomeModal
        isOpen={showIncomeModal}
        editIncome={editIncomeItem}
        onClose={() => {
          setShowIncomeModal(false);
          setEditIncomeItem(null);
        }}
        onSuccess={() => fetchDashboardData()}
      />

      <AddSharedExpenseModal
        isOpen={showSharedModal}
        onClose={() => setShowSharedModal(false)}
        onSuccess={() => fetchDashboardData()}
      />

      {/* In-App Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteItem}
        loading={deleting}
        title={deleteTarget?.type === 'income' ? 'আয় মুছে ফেলতে চান?' : 'খরচ মুছে ফেলতে চান?'}
        message={deleteTarget?.title 
          ? `আপনি কি নিশ্চিত যে "${deleteTarget.title}" তালিকা থেকে মুছে ফেলতে চান?`
          : `আপনি কি নিশ্চিত যে এই ${deleteTarget?.type === 'income' ? 'আয়টি' : 'খরচটি'} মুছে ফেলতে চান?`
        }
      />
    </div>
  );
};

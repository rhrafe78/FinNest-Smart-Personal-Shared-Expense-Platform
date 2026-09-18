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
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (!data) return null;

  const curr = data.currency === 'BDT' ? '৳' : data.currency === 'USD' ? '$' : '৳';
  const daily = data.daily_tracker || {
    today_expense: '0.00',
    daily_target: '500.00',
    difference: '500.00',
    is_profit: true,
    expenses_list: [],
    count: 0
  };
  const salary = data.salary_breakdown || {
    monthly_salary: '0.00',
    effective_income: '0.00',
    total_spent_this_month: '0.00',
    remaining_salary: '0.00',
    spent_pct: 0.0,
    is_overspent: false,
    categories: {}
  };
  const shared = data.shared_summary || {
    active_households: 0,
    you_owe: '0.00',
    others_owe_you: '0.00',
    pending_settlements: 0,
    upcoming_bills: 0
  };

  const remainingNum = parseFloat(salary.remaining_salary || '0');
  const salaryNum = parseFloat(salary.effective_income || '0');
  const spentPct = salary.spent_pct || 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900/10 via-indigo-900/10 to-slate-900/5 dark:from-brand-950/40 dark:via-indigo-950/20 dark:to-[#0a0e17] p-5 sm:p-6 rounded-3xl border border-brand-200/50 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold mb-1.5">
            <Calendar className="w-3.5 h-3.5" /> {daily.today_date_formatted || 'Today'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            স্বাগতম, {user?.first_name || user?.username || 'ইউজার'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            আজকের খরচ, মাসিক অবশিষ্ট টাকা এবং মেসের ব্যালেন্স এক নজরে
          </p>
        </div>

        {/* Big, Friendly Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowExpenseModal(true)}
            className="text-xs font-bold shadow-lg shadow-brand-500/25 px-4 py-2.5"
          >
            + আজকের খরচ লিখুন
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={Home}
            onClick={() => setShowSharedModal(true)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800 bg-white/50 dark:bg-slate-900/50 px-4 py-2.5"
          >
            + মেসের খরচ
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={TrendingUp}
            onClick={() => setShowIncomeModal(true)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
          >
            + আয়
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Edit3}
            onClick={() => setShowSettingsModal(true)}
            className="text-xs font-semibold text-slate-500"
            title="স্যালারি ও টার্গেট সেটিংস"
          >
            ⚙️ সেটিংস
          </Button>
        </div>
      </div>

      {/* 2. THREE PRIMARY CORE CARDS - BIG, BOLD, AND EASY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Cash in Hand (Remaining Balance) */}
        <div className={`p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden space-y-3 ${
          salary.is_overspent
            ? 'border-rose-500/70 bg-gradient-to-br from-rose-50/80 via-white to-rose-100/50 dark:from-rose-950/40 dark:via-[#111827] dark:to-rose-950/20'
            : 'border-emerald-500/70 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/50 dark:from-emerald-950/40 dark:via-[#111827] dark:to-emerald-950/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {salary.is_overspent ? '⚠️ অতিরিক্ত খরচ (ঘাটতি)' : '💵 হাতে অবশিষ্ট টাকা (Cash in Hand)'}
            </span>
            <div className={`p-2 rounded-xl ${salary.is_overspent ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {salary.is_overspent ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>

          <div className={`text-3xl font-black font-mono tracking-tight ${salary.is_overspent ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {curr} {Math.abs(remainingNum).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>মূল মাসিক স্যালারি: <strong className="text-slate-700 dark:text-slate-200 font-mono">{curr} {parseFloat(salary.monthly_salary).toLocaleString()}</strong></span>
            <span>মোট খরচ: <strong className="text-rose-500 font-mono">{curr} {parseFloat(salary.total_spent_this_month).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Card 2: Today's Expense vs Target */}
        <div className="p-6 rounded-3xl border-2 border-brand-500/40 bg-white dark:bg-[#111827] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              📅 আজকের মোট খরচ (Today's Spend)
            </span>
            <Badge variant={daily.is_profit ? 'success' : 'danger'} className="text-[10px] font-bold">
              {daily.is_profit ? '🎉 লাভ / সেভ' : '⚠️ লিমিট পার'}
            </Badge>
          </div>

          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
            {curr} {parseFloat(daily.today_expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between">
            <span className="text-slate-400">দৈনিক লিমিট: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{curr} {parseFloat(daily.daily_target).toLocaleString()}</strong></span>
            <span className={daily.is_profit ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
              {daily.is_profit ? `+৳${parseFloat(daily.difference).toFixed(0)} বেঁচেছে` : `-৳${parseFloat(daily.difference).toFixed(0)} বেশি`}
            </span>
          </div>
        </div>

        {/* Card 3: Shared Mess Live Status */}
        <div className="p-6 rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-50/50 via-white to-brand-50/30 dark:from-indigo-950/30 dark:via-[#111827] dark:to-slate-900/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              👥 মেসের বর্তমান হিসাব (Mess Status)
            </span>
            <Link to="/app/households" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              মেস হাব <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="text-3xl font-black font-mono tracking-tight">
            {parseFloat(shared.others_owe_you || '0') > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">+{curr} {parseFloat(shared.others_owe_you).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            ) : parseFloat(shared.you_owe || '0') > 0 ? (
              <span className="text-rose-600 dark:text-rose-400">-{curr} {parseFloat(shared.you_owe).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            ) : (
              <span className="text-slate-700 dark:text-slate-300">৳ 0.00</span>
            )}
          </div>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              {parseFloat(shared.others_owe_you || '0') > 0
                ? '🎉 আপনি মেসের কাছে টাকা পাবেন'
                : parseFloat(shared.you_owe || '0') > 0
                ? '⚠️ মেসে আপনার বকেয়া দেনা'
                : 'সব হিসাব সমান (কোনো দেনা নেই)'}
            </span>
            <span className="font-semibold text-brand-600">{shared.active_households || 0} টি মেস</span>
          </div>
        </div>
      </div>

      {/* 3. TODAY'S ITEM-BY-ITEM EXPENSES */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                আজকে কি কি খরচ করেছি ({daily.count || 0} টি)
              </h3>
              <p className="text-xs text-slate-400">আপনার আজকের খরচের তালিকা (এডিট বা ডিলিট করতে পারবেন)</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setShowExpenseModal(true)}
            className="text-xs font-bold"
          >
            + নতুন খরচ
          </Button>
        </div>

        {daily.expenses_list && daily.expenses_list.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {daily.expenses_list.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between hover:border-brand-300 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.merchant || item.title || 'খরচ'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                      {item.category || 'সাধারণ'}
                    </span>
                    <span>{item.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm shrink-0">
                    -{curr} {parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>

                  <div className="flex items-center gap-0.5 pl-1.5 border-l border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleEditExpense(item)}
                      className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded transition-colors"
                      title="Edit expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, 'expense', item.merchant || item.title)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 px-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              আজকে এখনও কোন খরচ হয়নি! 👏
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              কোন কিছু কিনলে বা বাজার করলে উপরে "+ আজকের খরচ লিখুন" বোতামে চাপ দিন।
            </p>
          </div>
        )}
      </div>

      {/* 4. ANALYTICS & CHARTS CALLOUT - Kept clean so the main dashboard is not heavy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-brand-50/80 via-white to-indigo-50/60 dark:from-brand-950/30 dark:via-[#111827] dark:to-slate-900 border border-brand-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold shrink-0">
            <BarChart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              মাসিক আয়-ব্যয়ের গ্রাফ ও ক্যাটাগরি রিপোর্ট
            </h4>
            <p className="text-[11px] text-slate-400">
              গত ৬ মাসের ট্রেন্ড, বার-চার্ট এবং পাই-চার্ট আলাদা অ্যানালিটিক্স পাতায় সাজানো রয়েছে
            </p>
          </div>
        </div>
        <Link to="/app/analytics" className="shrink-0">
          <Button variant="outline" size="sm" className="text-xs font-bold">
            গ্রাফ ও রিপোর্ট দেখুন →
          </Button>
        </Link>
      </div>

      {/* 7. RECENT TRANSACTIONS TABLE */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              সাম্প্রতিক লেনদেনের তালিকা (Recent Ledger)
            </h3>
            <p className="text-xs text-slate-500">সর্বশেষ আয় ও ব্যয়ের এন্ট্রি</p>
          </div>
          <Link to="/app/transactions">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              সম্পূর্ণ লেজার দেখুন →
            </span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 font-semibold">বিবরণ / মার্চেন্ট</th>
                <th className="py-2.5 font-semibold">ক্যাটাগরি</th>
                <th className="py-2.5 font-semibold">তারিখ</th>
                <th className="py-2.5 font-semibold text-right">পরিমাণ</th>
                <th className="py-2.5 font-semibold text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.recent_transactions && data.recent_transactions.length > 0 ? (
                data.recent_transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'}`}>
                        {tx.type === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <span className="truncate max-w-[200px]">{tx.title}</span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {tx.category}
                    </td>
                    <td className="py-3 text-slate-500">
                      {tx.date}
                    </td>
                    <td className={`py-3 font-mono font-bold text-right ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{curr} {parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditRecent(tx)}
                          className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(tx.id, tx.type, tx.title)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-1.5 text-slate-400">
                      <Clock className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">এখনও কোন সাম্প্রতিক লেনদেনের রেকর্ড নেই</p>
                      <p className="text-[11px] text-slate-400">উপরে "+ আজকের খরচ লিখুন" বা "+ আয় / স্যালারি যোগ" বোতাম চাপুন।</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

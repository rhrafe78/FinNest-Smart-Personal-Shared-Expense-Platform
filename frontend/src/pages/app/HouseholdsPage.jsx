import React, { useState, useEffect } from 'react';
import {
  Home,
  Plus,
  Users,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Receipt,
  UserPlus,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  DollarSign,
  Edit2,
  Trash2,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

import { AddSharedExpenseModal } from '../../components/modals/AddSharedExpenseModal';
import { CreateHouseholdModal } from '../../components/modals/CreateHouseholdModal';
import { RecordSettlementModal } from '../../components/modals/RecordSettlementModal';
import { InviteMemberModal } from '../../components/modals/InviteMemberModal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';

export const HouseholdsPage = () => {
  const { user } = useAuth();
  const [households, setHouseholds] = useState([]);
  const [activeHouseholdId, setActiveHouseholdId] = useState('');
  const [activeHousehold, setActiveHousehold] = useState(null);

  const [balances, setBalances] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [simplifiedDebts, setSimplifiedDebts] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Edits
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editExpenseItem, setEditExpenseItem] = useState(null);
  const [showCreateHousehold, setShowCreateHousehold] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementPrefill, setSettlementPrefill] = useState({});
  const [copiedCode, setCopiedCode] = useState(false);

  // Join by code modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  const fetchHouseholds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/households/');
      const list = res.data.results || res.data;
      setHouseholds(list);
      if (list.length > 0) {
        const targetId = activeHouseholdId || list[0].id;
        setActiveHouseholdId(targetId);
        setActiveHousehold(list.find((h) => h.id === targetId) || list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholdDetails = async (hhId) => {
    if (!hhId) return;
    try {
      const [balRes, expRes, simpRes, setRes] = await Promise.all([
        api.get(`/households/${hhId}/balances/`),
        api.get(`/households/expenses/?household=${hhId}`),
        api.get(`/settlements/simplified/?household=${hhId}`),
        api.get(`/settlements/?household=${hhId}`),
      ]);
      setBalances(balRes.data);
      setExpenses(expRes.data.results || expRes.data);
      setSimplifiedDebts(simpRes.data);
      setSettlements(setRes.data.results || setRes.data);
    } catch (err) {
      console.error('Failed to load household details', err);
    }
  };

  useEffect(() => {
    if (activeHouseholdId) {
      const hh = households.find((h) => h.id === activeHouseholdId);
      if (hh) setActiveHousehold(hh);
      fetchHouseholdDetails(activeHouseholdId);
    }
  }, [activeHouseholdId]);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode) return;
    setJoinLoading(true);
    try {
      const res = await api.post('/households/join/', { invite_code: joinCode });
      setShowJoinModal(false);
      setJoinCode('');
      fetchHouseholds();
    } catch (err) {
      setJoinError(err.response?.data?.detail || 'Invalid or expired invite code.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleOpenSettlementFromSimplification = (plan) => {
    setSettlementPrefill({
      payer: plan.from_user_id,
      recipient: plan.to_user_id,
      amount: plan.amount,
    });
    setShowSettlementModal(true);
  };

  const canEditOrDelete = (exp) => {
    if (!user) return false;
    const isPayer = (exp.paid_by === user.id || exp.paid_by_detail?.id === user.id || exp.paid_by_detail?.email === user.email);
    const isOwner = activeHousehold?.user_role === 'owner' || activeHousehold?.created_by === user.id;
    return isPayer || isOwner;
  };

  const handleEditExpense = (exp) => {
    setEditExpenseItem(exp);
    setShowAddExpense(true);
  };

  // Delete modal state
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmAction: null,
    loading: false
  });

  const handleDeleteExpense = (exp) => {
    if (!canEditOrDelete(exp)) {
      alert('আপনি শুধুমাত্র নিজের যুক্ত করা খরচ মুছে ফেলতে পারবেন। অন্যের খরচ ডিলিট করা নিষেধ।');
      return;
    }
    setDeleteModalConfig({
      isOpen: true,
      title: 'মেসের খরচ মুছে ফেলতে চান?',
      message: `আপনি কি "${exp.title}" মেসের খরচটি মুছে ফেলতে চান? এটি মুছে ফেললে মেম্বারদের ব্যালেন্স পুনরায় হিসাব হবে।`,
      confirmAction: async () => {
        setDeleteModalConfig(prev => ({ ...prev, loading: true }));
        try {
          await api.delete(`/households/expenses/${exp.id}/`);
          setDeleteModalConfig({ isOpen: false, title: '', message: '', confirmAction: null, loading: false });
          fetchHouseholdDetails(activeHouseholdId);
        } catch (err) {
          alert(err.response?.data?.detail || 'খরচ মুছে ফেলতে সমস্যা হয়েছে।');
          setDeleteModalConfig(prev => ({ ...prev, loading: false }));
        }
      },
      loading: false
    });
  };

  const handleRemoveMember = (m) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'মেম্বার রিমুভ করতে চান?',
      message: `আপনি কি "${m.full_name}" কে মেস থেকে রিমুভ করতে চান?`,
      confirmAction: async () => {
        setDeleteModalConfig(prev => ({ ...prev, loading: true }));
        try {
          await api.delete(`/households/members/${m.membership_id}/`);
          setDeleteModalConfig({ isOpen: false, title: '', message: '', confirmAction: null, loading: false });
          fetchHouseholdDetails(activeHouseholdId);
          fetchHouseholds();
        } catch (err) {
          alert(err.response?.data?.detail || 'মেম্বার রিমুভ করতে সমস্যা হয়েছে।');
          setDeleteModalConfig(prev => ({ ...prev, loading: false }));
        }
      },
      loading: false
    });
  };

  const handleCopyCode = (code) => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDeleteHousehold = (hh) => {
    const targetHh = hh || activeHousehold;
    if (!targetHh) return;
    setDeleteModalConfig({
      isOpen: true,
      title: `"${targetHh.name}" মেসটি মুছে ফেলতে চান?`,
      message: `আপনি কি নিশ্চিত যে "${targetHh.name}" মেসটি সম্পূর্ণরূপে মুছে ফেলতে চান? মেসের সকল হিসাব, খরচ ও মেম্বার তালিকা চিরতরে মুছে যাবে।`,
      confirmAction: async () => {
        setDeleteModalConfig(prev => ({ ...prev, loading: true }));
        try {
          await api.delete(`/households/${targetHh.id}/`);
          setDeleteModalConfig({ isOpen: false, title: '', message: '', confirmAction: null, loading: false });
          setActiveHouseholdId('');
          setActiveHousehold(null);
          fetchHouseholds();
        } catch (err) {
          alert(err.response?.data?.detail || 'মেস মুছে ফেলতে সমস্যা হয়েছে। ওনার ছাড়া অন্য কেউ মেস ডিলিট করতে পারবেন না।');
          setDeleteModalConfig(prev => ({ ...prev, loading: false }));
        }
      },
      loading: false
    });
  };

  const curr = activeHousehold?.currency === 'BDT' ? '৳' : (activeHousehold?.currency || '৳');
  const totalMessExpense = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount || '0'), 0);
  const myMemberInfo = balances?.members?.find((m) => m.user_id === user?.id);
  const myNetNum = myMemberInfo ? parseFloat(myMemberInfo.net_balance || '0') : 0;
  const myPaidNum = myMemberInfo ? parseFloat(myMemberInfo.total_paid || '0') : 0;
  const myOwedNum = myMemberInfo ? parseFloat(myMemberInfo.total_owed || '0') : 0;
  const memberCount = balances?.members?.length || activeHousehold?.member_count || 1;
  const avgPerPerson = memberCount > 0 ? (totalMessExpense / memberCount) : 0;

  return (
    <div className="space-y-6">

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            👥 মেস ও রুমমেটদের হিসাব হাব
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            বাজার, বাসা ভাড়া ও বিল অটোমেটিক ভাগ—কে কত টাকা পাবে বা কাকে কত দিতে হবে তার লাইভ হিসাব
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowJoinModal(true)} className="text-xs font-semibold">
            কোড দিয়ে মেসে যোগ দিন
          </Button>
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setShowCreateHousehold(true)} className="text-xs font-semibold">
            নতুন মেস তৈরি
          </Button>
          {activeHousehold && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddExpense(true)} className="text-xs font-bold shadow-md shadow-brand-500/20">
              + মেসের খরচ লিখুন
            </Button>
          )}
        </div>
      </div>

      {/* Household Selector Tabs */}
      {households.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {households.map((h) => (
            <div
              key={h.id}
              onClick={() => setActiveHouseholdId(h.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                activeHouseholdId === h.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{h.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeHouseholdId === h.id ? 'bg-brand-700 text-brand-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {h.member_count} জন
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteHousehold(h);
                }}
                className={`p-1 rounded-lg hover:bg-rose-500 hover:text-white transition-colors ${
                  activeHouseholdId === h.id ? 'text-brand-200' : 'text-slate-400 hover:text-white'
                }`}
                title={`"${h.name}" মেসটি মুছে ফেলুন`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Household View */}
      {activeHousehold ? (
        <div className="space-y-6">
          {/* Household Banner & Invite Bar */}
          <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {activeHousehold.name}
                </h3>
                <Badge variant="brand">{activeHousehold.currency}</Badge>
              </div>
              <p className="text-xs text-slate-500">
                {activeHousehold.description || 'ব্যাচেলর মেস / শেয়ার্ড বাসা'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
                <span className="text-slate-400">ইনভাইট কোড:</span>
                <span className="font-bold text-brand-600 dark:text-brand-400 select-all">{activeHousehold.invite_code}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeHousehold.invite_code)}
                  className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded transition-colors"
                  title="কোড কপি করুন"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => setShowInviteModal(true)}
                className="font-bold text-xs"
              >
                + মেম্বার যোগ করুন
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteHousehold(activeHousehold)}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="এই মেসটি সম্পূর্ণ ডিলিট করুন"
              >
                মেস মুছুন
              </Button>
            </div>
          </div>

          {/* 🌟 ৪টি সহজ হিসাব সারাংশ কার্ড (এক নজরে মেসের দেনা-পাওনা) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Card 1: Your Personal Balance */}
            <div className={`p-5 rounded-3xl border-2 transition-all shadow-sm ${
              myNetNum > 0
                ? 'border-emerald-400/80 bg-emerald-50/70 dark:border-emerald-800/80 dark:bg-emerald-950/30'
                : myNetNum < 0
                ? 'border-rose-400/80 bg-rose-50/70 dark:border-rose-800/80 dark:bg-rose-950/30'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111827]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  আপনার ব্যক্তিগত দেনা-পাওনা
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  myNetNum > 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : myNetNum < 0
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {myNetNum > 0 ? '✓ ফেরত পাবেন' : myNetNum < 0 ? '⚠️ দিতে হবে' : 'ক্লিয়ার'}
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                myNetNum > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : myNetNum < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-800 dark:text-slate-200'
              }`}>
                {myNetNum > 0 ? '+' : ''}{curr} {Math.abs(myNetNum).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] mt-1.5 font-medium text-slate-600 dark:text-slate-400">
                {myNetNum > 0
                  ? '🎉 আপনি বেশি খরচ করেছেন, বাকিরা আপনাকে টাকা দেবে'
                  : myNetNum < 0
                  ? '⚠️ খরচের বাকি টাকা মেসের সদস্যদের পরিশোধ করতে হবে'
                  : '✨ আপনার কোনো বকেয়া বা পাওনা নেই'}
              </p>
            </div>

            {/* Card 2: Total Mess Expense */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  মেসের মোট খরচ
                </span>
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {curr} {totalMessExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] mt-1.5 text-slate-500 dark:text-slate-400">
                মোট {expenses.length}টি বাজার ও বিলের যোগফল
              </p>
            </div>

            {/* Card 3: What You Paid Out of Pocket */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  আপনি পকেট থেকে দিয়েছেন
                </span>
                <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {curr} {myPaidNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] mt-1.5 text-slate-500 dark:text-slate-400">
                আপনার ভাগের ন্যায্য খরচ: {curr} {myOwedNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Card 4: Per Person Average */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  জনপ্রতি গড় খরচ
                </span>
                <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {curr} {avgPerPerson.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] mt-1.5 text-slate-500 dark:text-slate-400">
                মেসের মোট {memberCount} জন সদস্যের সমান ভাগ
              </p>
            </div>

          </div>

          {/* 💡 SIMPLE MESS GUIDE BANNER */}
          <div className="p-4 rounded-2xl bg-brand-50/80 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/60 flex items-start gap-3 shadow-sm">
            <span className="text-xl">💡</span>
            <div className="text-xs text-brand-950 dark:text-brand-200 leading-relaxed">
              <strong className="font-bold text-brand-900 dark:text-brand-100">মেসের সহজ হিসাবের নিয়ম:</strong> যে সদস্য নিজের পকেট থেকে মেসের বেশি বাজার বা বিল দিয়েছে, সে মেস থেকে টাকা <strong className="text-emerald-700 dark:text-emerald-300">ফেরত পাবে (সবুজ)</strong>। আর যার বাজার/খরচের টাকা তার ভাগের চেয়ে কম পড়েছে, সে অন্যদের টাকা <strong className="text-rose-700 dark:text-rose-300">পরিশোধ করবে (লাল)</strong>।
            </div>
          </div>

          {/* SMART DEBT SIMPLIFICATION VISUALIZER */}
          {simplifiedDebts && simplifiedDebts.payments?.length > 0 && (

            <div className="p-5 rounded-3xl border-2 border-brand-500/80 bg-gradient-to-br from-brand-50/60 via-white to-indigo-50/40 dark:from-brand-950/40 dark:via-[#111827] dark:to-[#0f172a] space-y-3 shadow-md shadow-brand-500/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-200/60 dark:border-brand-900/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-brand-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      🤝 সহজ দেনা-পাওনা নিষ্পত্তি (কে কাকে কত টাকা দেবে)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      মেসের সকল হিসাব মিটিয়ে ফেলতে নিচের ব্যক্তিদের মধ্যে টাকা পরিশোধ করলেই চলবে
                    </p>
                  </div>
                </div>

                <Badge variant="success" className="text-[10px]">অটো হিসাব</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {simplifiedDebts.payments.map((plan, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{plan.from_user_name}</span>
                      <span className="text-brand-500 text-sm font-bold">&rarr; দেবে &rarr;</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{plan.to_user_name}</span>
                    </div>

                    <div className="flex items-baseline justify-between pt-0.5">
                      <span className="text-[11px] text-slate-400">টাকার পরিমাণ</span>
                      <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                        {curr} {parseFloat(plan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs py-1"
                      onClick={() => handleOpenSettlementFromSimplification(plan)}
                    >
                      টাকা পরিশোধ রেকর্ড করুন ✓
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIVE NET BALANCES BOARD */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>মেস সদস্য তালিকা ও পূর্ণাঙ্গ খরচ হিসাব</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/80">
                    {balances?.members?.length || 0} জন সদস্য
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  কে কত টাকা দিয়েছে, কার ভাগে কত পড়েছে এবং কে কত টাকা পাবে বা দেবে তার স্বয়ংক্রিয় হিসাব
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={UserPlus}
                  onClick={() => setShowInviteModal(true)}
                  className="text-xs font-bold"
                >
                  + মেম্বার যোগ করুন
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={DollarSign}
                  onClick={() => {
                    setSettlementPrefill({});
                    setShowSettlementModal(true);
                  }}
                  className="text-xs font-bold"
                >
                  হিসাব সেটেলমেন্ট
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">সদস্য (Member)</th>
                    <th className="py-3 px-4 font-semibold">রোল (Role)</th>
                    <th className="py-3 px-4 font-semibold text-right">কে কত দিয়েছে (Total Paid)</th>
                    <th className="py-3 px-4 font-semibold text-right">মাথাপিছু ভাগ (Share Owed)</th>
                    <th className="py-3 px-4 font-semibold text-right">পরিশোধিত (Settled)</th>
                    <th className="py-3 px-4 font-semibold text-right">নেট ব্যালেন্স (Balance)</th>
                    <th className="py-3 px-4 font-semibold text-center">স্ট্যাটাস (Status)</th>
                    <th className="py-3 px-4 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {balances?.members?.map((m) => {
                    const netNum = parseFloat(m.net_balance);
                    const isGetsBack = netNum > 0;
                    const isOwes = netNum < 0;

                    return (
                      <tr key={m.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {(m.full_name || m.username || 'M').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div>{m.full_name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{m.email}</div>
                            </div>
                            {m.user_id === user?.id && (
                              <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/80 px-1.5 py-0.5 rounded font-sans shrink-0">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-sans capitalize text-slate-500">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.role === 'owner' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {m.role === 'owner' ? 'মেস ওনার' : 'মেম্বার'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                          {curr} {parseFloat(m.total_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                          {curr} {parseFloat(m.total_owed).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500">
                          +{curr} {parseFloat(m.settlements_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-bold text-sm ${isGetsBack ? 'text-emerald-600 dark:text-emerald-400' : isOwes ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                          {isGetsBack ? '+' : ''}{curr} {netNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center font-sans">
                          <Badge variant={isGetsBack ? 'success' : isOwes ? 'danger' : 'neutral'}>
                            {isGetsBack ? `+${curr}${netNum.toFixed(0)} পাবে (Gets Back)` : isOwes ? `-${curr}${Math.abs(netNum).toFixed(0)} দেবে (Owes)` : 'ক্লিয়ার (Settled)'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {(activeHousehold?.user_role === 'owner' || activeHousehold?.created_by === user?.id) && m.user_id !== user?.id && (
                            <button
                              onClick={() => handleRemoveMember(m)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="মেম্বার রিমুভ করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SHARED EXPENSES FEED */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📋 মেসের খরচের খাতা (Expenses Log)</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {expenses.length}টি এন্ট্রি
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  মেসের সকল বাজার, বিল ও খরচের বিস্তারিত খতিয়ান
                </p>
              </div>

              <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddExpense(true)} className="font-bold text-xs shadow-md shadow-brand-500/20">
                + নতুন খরচ লিখুন
              </Button>
            </div>

            {expenses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                মেসে এখনও কোনো খরচ লেখা হয়নি। উপরে <strong>"+ নতুন খরচ লিখুন"</strong> বাটনে চাপ দিয়ে প্রথম খরচের হিসাব যুক্ত করুন।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4 font-semibold">খরচের নাম / বিবরণ</th>
                      <th className="py-3 px-4 font-semibold">ক্যাটাগরি</th>
                      <th className="py-3 px-4 font-semibold">কে টাকা দিয়েছে</th>
                      <th className="py-3 px-4 font-semibold">ভাগ করার নিয়ম</th>
                      <th className="py-3 px-4 font-semibold">তারিখ</th>
                      <th className="py-3 px-4 font-semibold text-right">মোট টাকা</th>
                      <th className="py-3 px-4 font-semibold">সবার ভাগ (Split)</th>
                      <th className="py-3 px-4 font-semibold text-center">অ্যাকশন</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {exp.title}
                          {exp.description && (
                            <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">{exp.description}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="brand">{exp.category}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span>{exp.paid_by_detail?.full_name || exp.paid_by_detail?.username}</span>
                            {(exp.paid_by === user?.id || exp.paid_by_detail?.id === user?.id) && (
                              <span className="text-[9px] bg-brand-50 text-brand-600 dark:bg-brand-950/80 px-1 rounded font-bold">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {exp.split_method}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {exp.date}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {curr} {parseFloat(exp.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {exp.participants?.map((p) => (
                              <span
                                key={p.id}
                                className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono"
                              >
                                {p.user?.full_name?.split(' ')[0]}: {curr}{parseFloat(p.share_amount).toLocaleString()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {canEditOrDelete(exp) ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditExpense(exp)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="খরচ পরিবর্তন করুন (Edit)"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(exp)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                title="খরচ মুছে ফেলুন (Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                              title="শুধুমাত্র যিনি খরচ দিয়েছেন তিনি পরিবর্তন করতে পারবেন"
                            >
                              <Lock className="w-3 h-3" /> অন্যের খরচ
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4">
          <Home className="w-14 h-14 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            You are not part of any shared household yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a household for your bachelor mess, student flat, or joint family, or join one with an invite code.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowJoinModal(true)}>
              Join with Code
            </Button>
            <Button variant="primary" onClick={() => setShowCreateHousehold(true)}>
              Create Household
            </Button>
          </div>
        </div>
      )}

      {/* Join Household by Code Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join Household with Code">
        <form onSubmit={handleJoinByCode} className="space-y-4">
          {joinError && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
              {joinError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              8-Character Join Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. FINNEST77"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowJoinModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={joinLoading}>
              Join Household
            </Button>
          </div>
        </form>
      </Modal>

      {/* Other Modals */}
      <AddSharedExpenseModal
        isOpen={showAddExpense}
        editExpense={editExpenseItem}
        onClose={() => {
          setShowAddExpense(false);
          setEditExpenseItem(null);
        }}
        initialHouseholdId={activeHouseholdId}
        onSuccess={() => fetchHouseholdDetails(activeHouseholdId)}
      />
      <CreateHouseholdModal
        isOpen={showCreateHousehold}
        onClose={() => setShowCreateHousehold(false)}
        onSuccess={fetchHouseholds}
      />
      <RecordSettlementModal
        isOpen={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        householdId={activeHouseholdId}
        prefillPayer={settlementPrefill.payer}
        prefillRecipient={settlementPrefill.recipient}
        prefillAmount={settlementPrefill.amount}
        onSuccess={() => fetchHouseholdDetails(activeHouseholdId)}
      />
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        household={activeHousehold}
        onSuccess={() => fetchHouseholdDetails(activeHouseholdId)}
      />

      {/* In-App Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModalConfig.confirmAction}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        loading={deleteModalConfig.loading}
      />
    </div>
  );
};

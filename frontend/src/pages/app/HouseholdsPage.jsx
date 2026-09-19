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
  Check,
  ChevronRight,
  Layers
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

  // Active view tab: 'balances' | 'settlements' | 'expenses'
  const [activeTab, setActiveTab] = useState('balances');

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
      setJoinError(err.response?.data?.detail || 'ইনভাইট কোডটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।');
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
  const pendingSettlementCount = simplifiedDebts?.payments?.length || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            মেস ও শেয়ার্ড হিসাব
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            বাজার, বাসা ভাড়া ও বিল অটোমেটিক ভাগ—কে কত টাকা পাবে বা কাকে কত দিতে হবে।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowJoinModal(true)}
            className="text-xs"
          >
            কোড দিয়ে মেসে যোগ দিন
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setShowCreateHousehold(true)}
            className="text-xs"
          >
            নতুন মেস তৈরি
          </Button>
          {activeHousehold && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddExpense(true)}
              className="text-xs shadow-sm shadow-brand-500/25"
            >
              + মেসের খরচ লিখুন
            </Button>
          )}
        </div>
      </div>

      {/* Household Selector Pills */}
      {households.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {households.map((h) => {
            const isActive = activeHouseholdId === h.id;
            return (
              <div
                key={h.id}
                onClick={() => setActiveHouseholdId(h.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-400 border border-slate-200/90 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{h.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {h.member_count} জন
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHousehold(h);
                  }}
                  className={`p-1 rounded-md transition-colors ${
                    isActive
                      ? 'text-slate-300 hover:text-white dark:text-slate-600 dark:hover:text-slate-900'
                      : 'text-slate-400 hover:text-rose-500'
                  }`}
                  title={`"${h.name}" মেসটি মুছে ফেলুন`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Household View */}
      {activeHousehold ? (
        <div className="space-y-6">
          {/* Household Banner Bar */}
          <div className="fin-card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeHousehold.name}
                </h3>
                <Badge variant="brand">{activeHousehold.currency}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeHousehold.description || 'ব্যাচেলর মেস / শেয়ার্ড বাসা'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
                <span className="text-slate-400">ইনভাইট কোড:</span>
                <span className="font-bold text-brand-600 dark:text-brand-400 select-all tracking-wider">
                  {activeHousehold.invite_code}
                </span>
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
                className="text-xs"
              >
                + মেম্বার যোগ
              </Button>
            </div>
          </div>

          {/* 4 Spacious Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Personal Balance */}
            <div className="fin-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>আপনার দেনা-পাওনা</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    myNetNum > 0
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : myNetNum < 0
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {myNetNum > 0 ? 'ফেরত পাবেন' : myNetNum < 0 ? 'দিতে হবে' : 'ক্লিয়ার'}
                </span>
              </div>
              <div
                className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
                  myNetNum > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : myNetNum < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {myNetNum > 0 ? '+' : ''}{curr} {Math.abs(myNetNum).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400">
                {myNetNum > 0
                  ? 'আপনি বেশি দিয়েছেন, বাকিরা পরিশোধ করবে'
                  : myNetNum < 0
                  ? 'মেসের সদস্যদের বকেয়া টাকা দিতে হবে'
                  : 'কোনো বকেয়া বা পাওনা নেই'}
              </p>
            </div>

            {/* Card 2: Total Mess Expense */}
            <div className="fin-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>মেসের মোট খরচ</span>
                <Receipt className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                {curr} {totalMessExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400">
                মোট {expenses.length}টি বাজার ও বিলের যোগফল
              </p>
            </div>

            {/* Card 3: What You Paid */}
            <div className="fin-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>আপনি পকেট থেকে দিয়েছেন</span>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                {curr} {myPaidNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400">
                আপনার ন্যায্য ভাগ: {curr} {myOwedNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Card 4: Per Person Average */}
            <div className="fin-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>জনপ্রতি গড় খরচ</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                {curr} {avgPerPerson.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400">
                {memberCount} জন সদস্যের সমান অংশ
              </p>
            </div>
          </div>

          {/* Segmented Navigation Tabs to unclutter the view */}
          <div className="flex items-center justify-between border-b border-slate-200/90 dark:border-slate-800/80 pt-2">
            <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto pb-px">
              <button
                type="button"
                onClick={() => setActiveTab('balances')}
                className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition-all relative ${
                  activeTab === 'balances'
                    ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                মেম্বারদের হিসাব ({balances?.members?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settlements')}
                className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
                  activeTab === 'settlements'
                    ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <span>দেনা-পাওনা নিষ্পত্তি</span>
                {pendingSettlementCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('expenses')}
                className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition-all relative ${
                  activeTab === 'expenses'
                    ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                মেসের খরচের খাতা ({expenses.length})
              </button>
            </div>

            <div className="pb-2 hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={DollarSign}
                onClick={() => {
                  setSettlementPrefill({});
                  setShowSettlementModal(true);
                }}
                className="text-xs"
              >
                সেটেলমেন্ট রেকর্ড
              </Button>
            </div>
          </div>

          {/* TAB 1: MEMBERS & BALANCES */}
          {activeTab === 'balances' && (
            <div className="fin-card overflow-hidden animate-fade-in">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    সদস্য তালিকা ও ব্যালেন্স বিবরণী
                  </h3>
                  <p className="text-xs text-slate-400">
                    কে কত দিয়েছেন, কার ভাগে কত পড়েছে এবং মোট কার কত দেনা-পাওনা।
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={UserPlus}
                  onClick={() => setShowInviteModal(true)}
                  className="text-xs sm:hidden"
                >
                  + মেম্বার
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4 font-semibold">সদস্য</th>
                      <th className="py-3 px-4 font-semibold">ভূমিকা</th>
                      <th className="py-3 px-4 font-semibold text-right">মোট দিয়েছেন</th>
                      <th className="py-3 px-4 font-semibold text-right">মাথাপিছু ভাগ</th>
                      <th className="py-3 px-4 font-semibold text-right">পরিশোধিত</th>
                      <th className="py-3 px-4 font-semibold text-right">নেট ব্যালেন্স</th>
                      <th className="py-3 px-4 font-semibold text-center">স্ট্যাটাস</th>
                      <th className="py-3 px-4 font-semibold text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {balances?.members?.map((m) => {
                      const netNum = parseFloat(m.net_balance);
                      const isGetsBack = netNum > 0;
                      const isOwes = netNum < 0;

                      return (
                        <tr key={m.user_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs shrink-0">
                                {(m.full_name || m.username || 'M').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold">{m.full_name}</div>
                                <div className="text-[10px] text-slate-400">{m.email}</div>
                              </div>
                              {m.user_id === user?.id && (
                                <span className="text-[9px] bg-brand-50 text-brand-600 dark:bg-brand-950/80 px-1.5 py-0.5 rounded font-bold shrink-0">
                                  আপনি
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            <span className="text-xs">
                              {m.role === 'owner' ? 'মেস ওনার' : 'সদস্য'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                            {curr} {parseFloat(m.total_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                            {curr} {parseFloat(m.total_owed).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-400">
                            {curr} {parseFloat(m.settlements_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`py-3.5 px-4 text-right font-mono font-bold tabular-nums text-sm ${
                            isGetsBack ? 'text-emerald-600 dark:text-emerald-400' : isOwes ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                          }`}>
                            {isGetsBack ? '+' : ''}{curr} {netNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge variant={isGetsBack ? 'success' : isOwes ? 'danger' : 'neutral'} className="text-[11px]">
                              {isGetsBack ? `+${curr}${netNum.toFixed(0)} পাবে` : isOwes ? `-${curr}${Math.abs(netNum).toFixed(0)} দেবে` : 'হিসাব ক্লিয়ার'}
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
          )}

          {/* TAB 2: DEBT SETTLEMENT PLAN */}
          {activeTab === 'settlements' && (
            <div className="space-y-4 animate-fade-in">
              <div className="fin-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        স্বয়ংক্রিয় দেনা-পাওনা নিষ্পত্তি প্ল্যান
                      </h3>
                      <p className="text-xs text-slate-400">
                        সবার মধ্যে আলাদা করে জটিল হিসাব করার বদলে নিচের লেনদেনগুলো করলেই মেস সম্পূর্ণ ক্লিয়ার হয়ে যাবে।
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">অপ্টিমাইজড</Badge>
                </div>

                {!simplifiedDebts || simplifiedDebts.payments?.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      আলহামদুলিল্লাহ! মেসের কোনো বকেয়া নেই
                    </h4>
                    <p className="text-xs text-slate-400">
                      সকল সদস্যের হিসাব বর্তমানে সম্পূর্ণ সমান ও ক্লিয়ার আছে।
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                    {simplifiedDebts.payments.map((plan, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-rose-600 dark:text-rose-400">{plan.from_user_name}</span>
                          <span className="text-slate-400 text-xs font-normal">→ দেবে →</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{plan.to_user_name}</span>
                        </div>

                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-xs text-slate-400">টাকার পরিমাণ</span>
                          <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                            {curr} {parseFloat(plan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs py-1.5"
                          onClick={() => handleOpenSettlementFromSimplification(plan)}
                        >
                          পরিশোধ রেকর্ড করুন
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SHARED EXPENSES LOG */}
          {activeTab === 'expenses' && (
            <div className="fin-card overflow-hidden animate-fade-in">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    মেসের খরচের খতিয়ান
                  </h3>
                  <p className="text-xs text-slate-400">
                    মেসের সকল বাজার, বিল ও ব্যয়ের রসিদ তালিকা।
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setShowAddExpense(true)}
                  className="text-xs shadow-sm shadow-brand-500/25"
                >
                  + নতুন খরচ
                </Button>
              </div>

              {expenses.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Receipt className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    মেসে এখনও কোনো খরচ লেখা হয়নি
                  </h4>
                  <p className="text-xs text-slate-400">
                    প্রথম খরচের হিসাব লিখতে উপরে <strong>"+ নতুন খরচ"</strong> বাটনে চাপ দিন।
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {exp.title}
                          </span>
                          <Badge variant="brand" className="text-[10px] py-0 px-2">
                            {exp.category}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>পরিশোধকারী: <strong className="text-slate-700 dark:text-slate-300">{exp.paid_by_detail?.full_name || exp.paid_by_detail?.username}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-[11px]">{exp.date}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            {exp.participants?.map((p) => (
                              <span key={p.id} className="text-slate-400">
                                {p.user?.full_name?.split(' ')[0]}: {curr}{parseFloat(p.share_amount).toFixed(0)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                            {curr} {parseFloat(exp.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEditOrDelete(exp) ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEditExpense(exp)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="সম্পাদনা"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteExpense(exp)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span
                              className="p-1.5 text-slate-400 cursor-not-allowed"
                              title="অন্যের খরচ ডিলিট করা নিষেধ"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="fin-card p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Home className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              আপনি এখনও কোনো মেসে যোগ দেননি
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আপনার ব্যাচেলর মেস, ছাত্রাবাস বা যৌথ বাসার জন্য একটি মেস তৈরি করুন অথবা ইনভাইট কোড দিয়ে মেসে যোগ দিন।
            </p>
          </div>
          <div className="flex justify-center gap-2.5 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowJoinModal(true)}>
              কোড দিয়ে যোগ দিন
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateHousehold(true)}>
              নতুন মেস তৈরি করুন
            </Button>
          </div>
        </div>
      )}

      {/* Join Household Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="মেসে যোগ দিন">
        <form onSubmit={handleJoinByCode} className="space-y-4">
          {joinError && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
              {joinError}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              ৮-সংখ্যার ইনভাইট কোড লিখুন
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: FINNEST77"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowJoinModal(false)} type="button">
              বাতিল
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={joinLoading}>
              মেসে যোগ দিন
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

import React, { useState, useEffect } from 'react';
import { Upload, Users, Calculator, Percent, Divide, Home, Plus, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export const AddSharedExpenseModal = ({ isOpen, onClose, onSuccess, initialHouseholdId, editExpense = null }) => {
  const { user } = useAuth();
  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(initialHouseholdId || '');
  const [members, setMembers] = useState([]);

  // Quick create household state if user has none
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickHouseholdName, setQuickHouseholdName] = useState('');
  const [creatingHousehold, setCreatingHousehold] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Grocery',
    paid_by: '',
    date: new Date().toISOString().split('T')[0],
    split_method: 'EQUAL',
    description: '',
  });

  // Participant split mapping: { [user_id]: { selected: bool, exact: '', percent: '', shares: '1' } }
  const [participantsMap, setParticipantsMap] = useState({});
  const [showCustomSplit, setShowCustomSplit] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHouseholdsList = async () => {
    try {
      const res = await api.get('/households/');
      const list = res.data.results || res.data;
      setHouseholds(list);
      if (list.length > 0) {
        const activeId = editExpense?.household || initialHouseholdId || (list.some((h) => h.id === selectedHouseholdId) ? selectedHouseholdId : list[0].id);
        setSelectedHouseholdId(activeId);
      } else {
        setSelectedHouseholdId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHouseholdsList();
      if (editExpense) {
        setFormData({
          title: editExpense.title || '',
          amount: editExpense.amount || '',
          category: editExpense.category || 'Grocery',
          paid_by: editExpense.paid_by || editExpense.paid_by_detail?.id || '',
          date: editExpense.date || new Date().toISOString().split('T')[0],
          split_method: editExpense.split_method || 'EQUAL',
          description: editExpense.description || '',
        });
      } else {
        setFormData({
          title: '',
          amount: '',
          category: 'Grocery',
          paid_by: '',
          date: new Date().toISOString().split('T')[0],
          split_method: 'EQUAL',
          description: '',
        });
      }
    }
  }, [isOpen, initialHouseholdId, editExpense]);

  useEffect(() => {
    if (selectedHouseholdId && households.length > 0) {
      const hh = households.find((h) => h.id === selectedHouseholdId);
      if (hh && hh.members && hh.members.length > 0) {
        setMembers(hh.members);
        const currentMember = hh.members.find((m) => m.user.id === user?.id);
        const defaultPayerId = currentMember ? currentMember.user.id : hh.members[0].user.id;
        setFormData((prev) => {
          const isCurrentPayerValid = hh.members.some((m) => m.user.id === prev.paid_by);
          return { ...prev, paid_by: isCurrentPayerValid ? prev.paid_by : defaultPayerId };
        });

        const initialMap = {};
        const count = hh.members.length;
        const equalPct = count > 0 ? (100 / count).toFixed(2) : 0;
        hh.members.forEach((m) => {
          initialMap[m.user.id] = {
            selected: true,
            exact: '',
            percent: equalPct,
            shares: '1',
          };
        });
        setParticipantsMap(initialMap);
      } else if (hh) {
        // Safe fallback with creator user
        if (user?.id) {
          const fallbackMember = [{
            id: 'creator',
            user: user,
            role: 'owner'
          }];
          setMembers(fallbackMember);
          setFormData((prev) => ({ ...prev, paid_by: user.id }));
          setParticipantsMap({
            [user.id]: { selected: true, exact: '', percent: '100', shares: '1' }
          });
        }
      }
    } else {
      setMembers([]);
    }
  }, [selectedHouseholdId, households, user]);

  const handleQuickCreateHousehold = async (e) => {
    if (e) e.preventDefault();
    if (!quickHouseholdName.trim()) {
      setError('অনুগ্রহ করে মেস বা বাসার নাম লিখুন।');
      return;
    }
    setCreatingHousehold(true);
    setError('');
    try {
      const res = await api.post('/households/', {
        name: quickHouseholdName.trim(),
        currency: 'BDT',
      });
      const newHh = res.data;
      setQuickHouseholdName('');
      setShowQuickCreate(false);

      const listRes = await api.get('/households/');
      const updatedList = listRes.data.results || listRes.data || [];
      setHouseholds(updatedList);
      setSelectedHouseholdId(newHh.id);

      if (newHh.members && newHh.members.length > 0) {
        setMembers(newHh.members);
        const curMember = newHh.members.find((m) => m.user.id === user?.id) || newHh.members[0];
        setFormData((prev) => ({ ...prev, paid_by: curMember.user.id }));
        const initMap = {};
        newHh.members.forEach((m) => {
          initMap[m.user.id] = { selected: true, exact: '', percent: '100', shares: '1' };
        });
        setParticipantsMap(initMap);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'মেস তৈরি করতে ব্যর্থ হয়েছে।');
    } finally {
      setCreatingHousehold(false);
    }
  };

  const categories = [
    'Grocery', 'Rent', 'Electricity', 'Gas', 'Water', 'Wi-Fi',
    'Cleaning', 'Maintenance', 'Food', 'Transportation', 'Other'
  ];

  const handleSplitParticipantChange = (userId, field, value) => {
    setParticipantsMap((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedHouseholdId) {
      setError('অনুগ্রহ করে প্রথমে একটি মেস বা বাসা নির্বাচন করুন।');
      return;
    }

    const totalAmt = parseFloat(formData.amount);
    if (isNaN(totalAmt) || totalAmt <= 0) {
      setError('Please provide a valid total expense amount.');
      return;
    }

    const selectedUsers = Object.keys(participantsMap).filter((uid) => participantsMap[uid]?.selected);
    if (selectedUsers.length === 0) {
      setError('At least one member must be selected to split this expense.');
      return;
    }

    // Build participants payload
    let participantsPayload = [];

    if (formData.split_method === 'EQUAL') {
      const share = (totalAmt / selectedUsers.length).toFixed(2);
      participantsPayload = selectedUsers.map((uid) => ({
        user_id: uid,
        share_amount: share,
      }));
    } else if (formData.split_method === 'EXACT') {
      let sum = 0;
      for (const uid of selectedUsers) {
        const exactVal = parseFloat(participantsMap[uid].exact || 0);
        sum += exactVal;
        participantsPayload.push({
          user_id: uid,
          share_amount: exactVal.toFixed(2),
        });
      }
      if (Math.abs(sum - totalAmt) > 0.05) {
        setError(`Exact splits sum (${sum.toFixed(2)}) must equal total expense (${totalAmt.toFixed(2)}).`);
        return;
      }
    } else if (formData.split_method === 'PERCENTAGE') {
      let sumPct = 0;
      for (const uid of selectedUsers) {
        const pct = parseFloat(participantsMap[uid].percent || 0);
        sumPct += pct;
        const share = ((totalAmt * pct) / 100).toFixed(2);
        participantsPayload.push({
          user_id: uid,
          percentage: pct.toFixed(2),
          share_amount: share,
        });
      }
      if (Math.abs(sumPct - 100) > 0.1) {
        setError(`Percentages must sum to 100%. Current total: ${sumPct.toFixed(1)}%`);
        return;
      }
    } else if (formData.split_method === 'SHARES') {
      let totalShares = 0;
      selectedUsers.forEach((uid) => {
        totalShares += parseFloat(participantsMap[uid].shares || 1);
      });
      if (totalShares <= 0) totalShares = selectedUsers.length;

      participantsPayload = selectedUsers.map((uid) => {
        const sh = parseFloat(participantsMap[uid].shares || 1);
        const shareAmt = ((totalAmt * sh) / totalShares).toFixed(2);
        return {
          user_id: uid,
          shares: sh.toString(),
          share_amount: shareAmt,
        };
      });
    }

    setLoading(true);
    try {
      const payload = {
        household: selectedHouseholdId,
        title: formData.title,
        amount: formData.amount,
        category: formData.category,
        paid_by: formData.paid_by || user?.id,
        date: formData.date,
        split_method: formData.split_method,
        description: formData.description,
        participants: participantsPayload,
      };

      if (editExpense?.id) {
        await api.patch(`/households/expenses/${editExpense.id}/`, payload);
      } else {
        await api.post('/households/expenses/', payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save shared expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editExpense ? "মেসের খরচ পরিবর্তন করুন (Edit Shared Expense)" : "মেসের শেয়ার্ড খরচ যোগ করুন (Add Shared Expense)"}
      maxWidth="max-w-xl"
    >
      {/* CASE 1: USER HAS NO HOUSEHOLD YET */}
      {households.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Home className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              আপনার এখনও কোনো মেস বা ফ্ল্যাট যুক্ত করা নেই!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              বাসা ভাড়া, বিদ্যুৎ, গ্যাস, ওয়াইফাই বা মেস বাজারের হিসাব রাখতে প্রথমে একটি মেস তৈরি করুন।
            </p>
          </div>

          <div className="pt-2 max-w-md mx-auto space-y-3 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                মেস বা বাসার নাম (Household / Mess Name)
              </label>
              <input
                type="text"
                placeholder="যেমন: ধানমন্ডি মেস, গ্রিন ভিউ ফ্ল্যাট, বা ফ্যামিলি হোম"
                value={quickHouseholdName}
                onChange={(e) => setQuickHouseholdName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            {error && (
              <div className="p-2.5 text-xs bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
                {error}
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              className="w-full font-bold"
              isLoading={creatingHousehold}
              onClick={handleQuickCreateHousehold}
            >
              + মেস তৈরি করুন এবং খরচ লিখুন
            </Button>
          </div>
        </div>
      ) : (
        /* CASE 2: NORMAL EXPENSE FORM WITH ACTIVE HOUSEHOLDS */
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Household Selection + Inline Add Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Household / Mess (মেস নির্বাচন)
              </label>
              <button
                type="button"
                onClick={() => setShowQuickCreate(!showQuickCreate)}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> নতুন মেস তৈরি
              </button>
            </div>

            {showQuickCreate ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 mb-2">
                <input
                  type="text"
                  placeholder="নতুন মেসের নাম (e.g. ধানমন্ডি ফ্ল্যাট)"
                  value={quickHouseholdName}
                  onChange={(e) => setQuickHouseholdName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowQuickCreate(false)}>
                    বাতিল
                  </Button>
                  <Button type="button" variant="primary" size="sm" isLoading={creatingHousehold} onClick={handleQuickCreateHousehold}>
                    তৈরি করুন
                  </Button>
                </div>
              </div>
            ) : null}

            <select
              value={selectedHouseholdId}
              onChange={(e) => setSelectedHouseholdId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.currency || 'BDT'})</option>
              ))}
            </select>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                খরচের বিবরণ (Expense Title)
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: চাল-ডাল বাজার, ওয়াইফাই বিল, বাসা ভাড়া"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                ক্যাটাগরি (Category)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                {categories.map((c) => {
                  const labels = {
                    'Rent': '🏠 বাসা ভাড়া (Rent)',
                    'Electricity': '⚡ বিদ্যুৎ বিল (Electricity)',
                    'Gas': '🔥 গ্যাস বিল (Gas Bill)',
                    'Water': '💧 পানি বিল (Water Bill)',
                    'Wi-Fi': '📶 ওয়াই-ফাই বিল (Wi-Fi Bill)',
                    'Grocery': '🛒 মেস বাজার / মুদি (Grocery)',
                    'Cleaning': '🧹 খালা ও ক্লিনিং (Cleaning)',
                    'Maintenance': '🔧 সার্ভিস চার্জ ও মেরামত (Maintenance)',
                    'Food': '🍔 খাবার ও মিল (Food & Meal)',
                    'Transportation': '🚌 যাতায়াত (Transportation)',
                    'Other': '📦 অন্যান্য খরচ (Other)',
                  };
                  return <option key={c} value={c}>{labels[c] || c}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Amount, Paid By, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                মোট টাকার পরিমাণ (৳) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border-2 border-brand-500/30 focus:border-brand-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              {/* Quick Amount Pills */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[100, 200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const current = parseFloat(formData.amount || '0');
                      setFormData({ ...formData, amount: String(current + amt) });
                    }}
                    className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 hover:bg-brand-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    +৳{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                টাকা কে দিয়েছে? (Payer)
              </label>
              <select
                value={formData.paid_by}
                onChange={(e) => setFormData({ ...formData, paid_by: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                {members.length > 0 ? (
                  members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.full_name || m.user.username} {m.user.id === user?.id ? '(আপনি / You)' : ''}
                    </option>
                  ))
                ) : (
                  <option value={user?.id}>{user?.full_name || user?.username || 'You'} (আপনি)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                খরচের তারিখ
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Super Easy Split Section: Simple Default vs Custom Expander */}
          {!showCustomSplit ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  মেসের সকল ({members.length} জন) সদস্যের মাঝে সমান ভাগ হবে
                </div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  {formData.amount && parseFloat(formData.amount) > 0 && members.length > 0
                    ? `💡 জনপ্রতি খরচ পড়বে: ৳ ${(parseFloat(formData.amount) / members.length).toFixed(2)}`
                    : 'টাকা লিখলে স্বয়ংক্রিয়ভাবে সবার সমান ভাগ হিসাব হবে'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCustomSplit(true);
                }}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline shrink-0"
              >
                ⚙️ কাস্টম বা আলাদা ভাগ চান?
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  কাস্টম ভাগ করার নিয়ম (Custom Split)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomSplit(false);
                    setFormData((prev) => ({ ...prev, split_method: 'EQUAL' }));
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  ✓ সবার মাঝে সমান ভাগ করুন
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'EQUAL', label: 'সমান ভাগ (Equal)', icon: Divide },
                  { id: 'EXACT', label: 'নির্দিষ্ট টাকা (Exact)', icon: Calculator },
                  { id: 'PERCENTAGE', label: 'শতাংশ (%)', icon: Percent },
                  { id: 'SHARES', label: 'শেয়ার অনুপাত', icon: Users },
                ].map((method) => {
                  const Icon = method.icon;
                  const active = formData.split_method === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, split_method: method.id })}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        active
                          ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{method.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                {members.map((m) => {
                  const part = participantsMap[m.user.id] || { selected: true, exact: '', percent: '100', shares: '1' };
                  return (
                    <div
                      key={m.user.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        part.selected
                          ? 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-700 shadow-sm'
                          : 'bg-slate-100/50 dark:bg-slate-900/20 border-transparent opacity-60'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(part.selected)}
                          onChange={(e) => handleSplitParticipantChange(m.user.id, 'selected', e.target.checked)}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {m.user.full_name || m.user.username} {m.user.id === user?.id ? '(আপনি)' : ''}
                          </div>
                        </div>
                      </label>

                      {part.selected && (
                        <div className="w-32 text-right">
                          {formData.split_method === 'EQUAL' && (
                            <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                              {formData.amount && Object.keys(participantsMap).filter((k) => participantsMap[k]?.selected).length > 0
                                ? `৳ ${(parseFloat(formData.amount) / Object.keys(participantsMap).filter((k) => participantsMap[k]?.selected).length).toFixed(2)}`
                                : '৳ 0.00'}
                            </span>
                          )}
                          {formData.split_method === 'EXACT' && (
                            <input
                              type="number"
                              step="0.01"
                              placeholder="৳ 0.00"
                              value={part.exact || ''}
                              onChange={(e) => handleSplitParticipantChange(m.user.id, 'exact', e.target.value)}
                              className="w-full px-2 py-1 text-xs text-right font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                            />
                          )}
                          {formData.split_method === 'PERCENTAGE' && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="%"
                                value={part.percent || ''}
                                onChange={(e) => handleSplitParticipantChange(m.user.id, 'percent', e.target.value)}
                                className="w-full px-2 py-1 text-xs text-right font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                              />
                              <span className="text-xs font-mono text-slate-400">%</span>
                            </div>
                          )}
                          {formData.split_method === 'SHARES' && (
                            <div className="flex items-center gap-1 justify-end">
                              <input
                                type="number"
                                step="0.5"
                                value={part.shares || '1'}
                                onChange={(e) => handleSplitParticipantChange(m.user.id, 'shares', e.target.value)}
                                className="w-16 px-2 py-1 text-xs text-center font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                              />
                              <span className="text-[10px] text-slate-400">ভাগ</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              নোট বা অতিরিক্ত তথ্য (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="খরচের কোনো বিশেষ নোট..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              বাতিল
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={loading} className="font-bold">
              {editExpense ? "খরচ আপডেট করুন (Update Expense)" : "মেসের খরচ সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

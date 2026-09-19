import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, Home, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export const RecordSettlementModal = ({
  isOpen,
  onClose,
  onSuccess,
  householdId,
  prefillPayer,
  prefillRecipient,
  prefillAmount
}) => {
  const { user } = useAuth();
  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(householdId || '');
  const [members, setMembers] = useState([]);

  const [formData, setFormData] = useState({
    payer: prefillPayer || '',
    recipient: prefillRecipient || '',
    amount: prefillAmount || '',
    payment_method: 'bKash Transfer',
    date: new Date().toISOString().split('T')[0],
    status: 'settled',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (prefillPayer) setFormData((prev) => ({ ...prev, payer: prefillPayer }));
      if (prefillRecipient) setFormData((prev) => ({ ...prev, recipient: prefillRecipient }));
      if (prefillAmount) setFormData((prev) => ({ ...prev, amount: prefillAmount }));

      api.get('/households/')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setHouseholds(list);
          const activeId = householdId || (list.length > 0 ? list[0].id : '');
          setSelectedHouseholdId(activeId);
        })
        .catch(() => {});
    }
  }, [isOpen, householdId, prefillPayer, prefillRecipient, prefillAmount]);

  useEffect(() => {
    if (selectedHouseholdId) {
      const hh = households.find((h) => h.id === selectedHouseholdId);
      if (hh && hh.members) {
        setMembers(hh.members);
        if (!formData.payer && hh.members.length > 0) {
          setFormData((prev) => ({ ...prev, payer: hh.members[0].user.id }));
        }
        if (!formData.recipient && hh.members.length > 1) {
          setFormData((prev) => ({ ...prev, recipient: hh.members[1].user.id }));
        }
      }
    }
  }, [selectedHouseholdId, households]);

  const activeHousehold = households.find((h) => h.id === selectedHouseholdId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedHouseholdId) {
      setError('Please select a household.');
      return;
    }

    if (formData.payer === formData.recipient) {
      setError('Payer and recipient cannot be the same person.');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/settlements/', {
        household: selectedHouseholdId,
        ...formData,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record settlement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Settlement & Repayment">
      {households.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Home className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No household selected or joined yet!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a household and invite your roommates to start recording debt settlements.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Household Selector is ALWAYS accessible */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Household
            </label>
            <select
              value={selectedHouseholdId}
              onChange={(e) => setSelectedHouseholdId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {members.length < 2 ? (
            <div className="p-6 text-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  At least 2 members are required in this household
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Share your invite code with roommates so they can join and settle balances.
                </p>
                {activeHousehold?.invite_code && (
                  <div className="pt-2 font-mono text-sm font-bold text-brand-600 dark:text-brand-400">
                    Household Invite Code: <span className="bg-brand-100 dark:bg-brand-900/60 px-2 py-1 rounded-lg select-all">{activeHousehold.invite_code}</span>
                  </div>
                )}
              </div>
              <div className="pt-2 flex justify-center">
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
                  {error}
                </div>
              )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payer (Who Paid?)
              </label>
              <select
                value={formData.payer}
                onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.full_name || m.user.username} {m.user.id === user?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Recipient (Who Received?)
              </label>
              <select
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.full_name || m.user.username} {m.user.id === user?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Amount (৳)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="bKash Transfer">bKash Transfer</option>
                <option value="Nagad Transfer">Nagad Transfer</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank Instant Transfer">Bank Instant Transfer</option>
                <option value="Cash Handover">Cash Handover</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Notes / TrxID (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. bKash TrxID or note..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              Confirm Settlement
            </Button>
          </div>
        </form>
          )}
        </div>
      )}
    </Modal>
  );
};

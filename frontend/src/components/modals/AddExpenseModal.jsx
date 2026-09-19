import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import api from '../../api/client';

export const AddExpenseModal = ({ isOpen, onClose, onSuccess, editExpense = null }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    payment_method: 'card',
    notes: '',
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/personal/categories/')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          const expCats = list.filter((c) => c.category_type === 'expense' || c.category_type === 'both');
          setCategories(expCats);
          if (expCats.length > 0 && !formData.category && !editExpense) {
            setFormData((prev) => ({ ...prev, category: expCats[0].id }));
          }
        })
        .catch(() => {});

      if (editExpense) {
        setFormData({
          merchant: editExpense.merchant || editExpense.title || '',
          amount: editExpense.amount || '',
          date: editExpense.date || new Date().toISOString().split('T')[0],
          category: editExpense.category_id || '',
          payment_method: editExpense.payment_method_raw || 'card',
          notes: editExpense.notes || '',
        });
      } else {
        setFormData({
          merchant: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
          payment_method: 'card',
          notes: '',
        });
        setReceiptFile(null);
      }
    }
  }, [isOpen, editExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.merchant || !formData.amount) {
      setError('Please provide merchant name and amount.');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      if (receiptFile) {
        data.append('receipt', receiptFile);
      }

      if (editExpense?.id) {
        await api.patch(`/personal/expenses/${editExpense.id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/personal/expenses/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editExpense ? "Edit Expense Record" : "Add Personal Expense"}
      description="Keep your personal day-to-day spending accurately organized"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Expense Title or Merchant <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Lunch meal, Uber ride, Coffee, Groceries, Pharmacy..."
            value={formData.merchant}
            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium placeholder:text-slate-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Amount (৳) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Quick Add:</span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">৳</span>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-brand-500/30 focus:border-brand-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          {/* Quick Amount Add Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {[20, 50, 100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  const current = parseFloat(formData.amount || '0');
                  setFormData({ ...formData, amount: String(current + amt) });
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                +৳{amt}
              </button>
            ))}
            {formData.amount && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: '' })}
                className="px-2 py-1 text-xs text-rose-500 hover:underline font-semibold ml-auto"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash', label: '💵 Cash' },
              { id: 'mobile_banking', label: '📱 Mobile Banking' },
              { id: 'card', label: '💳 Debit / Credit Card' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: method.id })}
                className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                  formData.payment_method === method.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} type="button" className="text-xs font-semibold">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading} className="px-6 py-2 text-xs font-bold shadow-md shadow-brand-500/20">
            {editExpense ? "Update Expense" : "Save Expense ✓"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

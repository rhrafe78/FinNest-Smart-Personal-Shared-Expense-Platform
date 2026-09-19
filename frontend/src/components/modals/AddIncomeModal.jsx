import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import api from '../../api/client';

export const AddIncomeModal = ({ isOpen, onClose, onSuccess, editIncome = null }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    notes: '',
    is_recurring: false,
    recurrence_frequency: 'none',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/personal/categories/')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          const incCats = list.filter((c) => c.category_type === 'income' || c.category_type === 'both');
          setCategories(incCats);
          if (incCats.length > 0 && !formData.category && !editIncome) {
            setFormData((prev) => ({ ...prev, category: incCats[0].id }));
          }
        })
        .catch(() => {});

      if (editIncome) {
        setFormData({
          source: editIncome.source || editIncome.title || '',
          amount: editIncome.amount || '',
          date: editIncome.date || new Date().toISOString().split('T')[0],
          category: editIncome.category_id || '',
          notes: editIncome.notes || '',
          is_recurring: !!editIncome.is_recurring,
          recurrence_frequency: editIncome.recurrence_frequency || 'none',
        });
      } else {
        setFormData({
          source: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
          notes: '',
          is_recurring: false,
          recurrence_frequency: 'none',
        });
      }
    }
  }, [isOpen, editIncome]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.source || !formData.amount) {
      setError('Please provide income source and amount.');
      return;
    }
    setLoading(true);
    try {
      if (editIncome?.id) {
        await api.patch(`/personal/incomes/${editIncome.id}/`, formData);
      } else {
        await api.post('/personal/incomes/', formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save income.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editIncome ? "Edit Income Record" : "Add Income & Salary"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Income Source / Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Monthly Tech Salary, Freelance Milestone"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Amount (৳ / Currency)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
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
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="inc-recurring"
            checked={formData.is_recurring}
            onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked, recurrence_frequency: e.target.checked ? 'monthly' : 'none' })}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
          />
          <label htmlFor="inc-recurring" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Recurring Income (e.g. Monthly Salary)
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Notes (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add relevant notes or transaction details..."
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
            Save Income
          </Button>
        </div>
      </form>
    </Modal>
  );
};

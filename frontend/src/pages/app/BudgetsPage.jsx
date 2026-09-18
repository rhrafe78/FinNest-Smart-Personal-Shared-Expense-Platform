import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, AlertTriangle, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { AddBudgetModal } from '../../components/modals/AddBudgetModal';

export const BudgetsPage = () => {
  const { currency } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchBudgets = () => {
    setLoading(true);
    api.get('/budgets/')
      .then((res) => setBudgets(res.data.results || res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}/`);
      fetchBudgets();
    } catch (err) {
      alert('Failed to delete budget.');
    }
  };

  const curr = currency === 'BDT' ? '৳' : '$';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Monthly Category Budgets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set spending limits on categories. Get warned proactively before exceeding your plan.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
          Create Budget
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
          Loading active budgets...
        </div>
      ) : budgets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3">
          <PiggyBank className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No active budgets</h3>
          <p className="text-xs text-slate-500">Create a budget for Food, Rides, or Entertainment to stay in control.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const pct = b.usage_percentage;
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b.id}
                className={`p-6 rounded-3xl border bg-white dark:bg-[#111827] space-y-5 transition-all shadow-sm ${
                  isExceeded
                    ? 'border-rose-400 dark:border-rose-900/60'
                    : isWarning
                    ? 'border-amber-400 dark:border-amber-900/60'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top card bar */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">
                      {b.category_name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {b.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isExceeded ? 'danger' : isWarning ? 'warning' : 'success'}>
                      {isExceeded ? 'Exceeded' : isWarning ? 'Near Limit' : 'On Track'}
                    </Badge>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300 font-mono">
                      {curr} {parseFloat(b.spent_amount).toLocaleString()} spent
                    </span>
                    <span className={isExceeded ? 'text-rose-600 font-bold' : isWarning ? 'text-amber-500 font-bold' : 'text-slate-500'}>
                      {pct}% used
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Card summary stats */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span>Budget Limit: </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {curr} {parseFloat(b.amount).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span>Remaining: </span>
                    <span className={`font-bold font-mono ${parseFloat(b.remaining_amount) < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {curr} {parseFloat(b.remaining_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddBudgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchBudgets}
      />
    </div>
  );
};

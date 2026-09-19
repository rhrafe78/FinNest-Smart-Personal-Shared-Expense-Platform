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

  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '৳';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Budgets & Limits
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set category spending limits and get timely alerts before overspending.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
          className="text-xs shadow-sm shadow-brand-500/25"
        >
          + Create Budget
        </Button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs space-y-3">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="fin-card p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <PiggyBank className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No active budgets found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create spending limits for groceries, dining, or transport to stay on track.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
              Set First Budget
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const pct = b.usage_percentage;
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b.id}
                className="fin-card p-5 sm:p-6 space-y-4 transition-all"
              >
                {/* Top card bar */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">
                      {b.category_name}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {b.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isExceeded ? 'danger' : isWarning ? 'warning' : 'success'} className="text-[11px]">
                      {isExceeded ? 'Exceeded' : isWarning ? 'Near Limit' : 'On Track'}
                    </Badge>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                      Spent {curr} {parseFloat(b.spent_amount).toLocaleString()}
                    </span>
                    <span className={`font-mono tabular-nums ${isExceeded ? 'text-rose-600 font-bold' : isWarning ? 'text-amber-500 font-bold' : 'text-slate-500'}`}>
                      {pct}% used
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Card summary stats */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span>Budget Limit: </span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                      {curr} {parseFloat(b.amount).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span>Remaining: </span>
                    <span className={`font-semibold font-mono tabular-nums ${parseFloat(b.remaining_amount) < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
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

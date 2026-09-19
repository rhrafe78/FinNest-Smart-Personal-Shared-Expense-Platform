import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { AddSavingsGoalModal } from '../../components/modals/AddSavingsGoalModal';

export const SavingsPage = () => {
  const { currency } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Add funds modal
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundNotes, setFundNotes] = useState('');
  const [fundingLoading, setFundingLoading] = useState(false);

  const fetchGoals = () => {
    setLoading(true);
    api.get('/savings/goals/')
      .then((res) => setGoals(res.data.results || res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddFundsSubmit = async (e) => {
    e.preventDefault();
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;
    setFundingLoading(true);
    try {
      await api.post(`/savings/goals/${selectedGoal.id}/add-funds/`, {
        amount: fundAmount,
        notes: fundNotes,
      });
      setSelectedGoal(null);
      setFundAmount('');
      setFundNotes('');
      fetchGoals();
    } catch (err) {
      alert('Failed to deposit funds.');
    } finally {
      setFundingLoading(false);
    }
  };

  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '৳';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Savings Goals & Milestones
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Save for emergency funds, gadgets, travel, and personal milestones.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
          className="text-xs shadow-sm shadow-brand-500/25"
        >
          + New Savings Goal
        </Button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs space-y-3">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading savings goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="fin-card p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No savings goals created yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Set a target amount and build your emergency fund bit by bit.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>
              Set First Goal
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const pct = g.progress_percentage;
            const isFinished = pct >= 100;

            return (
              <div
                key={g.id}
                className="fin-card p-5 sm:p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">
                        {g.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {g.name}
                      </h3>
                    </div>
                    <Badge variant={isFinished ? 'success' : 'brand'} className="text-[11px]">
                      {isFinished ? 'Goal Reached!' : `${pct}%`}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium font-mono tabular-nums">
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {curr} {parseFloat(g.current_amount).toLocaleString()}
                      </span>
                      <span className="text-slate-400">
                        Target: {curr} {parseFloat(g.target_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta stats */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Target Date:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {g.target_date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Recommended Monthly Saving:
                      </span>
                      <span className="font-bold text-brand-600 dark:text-brand-400 font-mono tabular-nums">
                        ~{curr} {parseFloat(g.recommended_monthly_saving).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    icon={DollarSign}
                    onClick={() => setSelectedGoal(g)}
                  >
                    Deposit Funds
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Funds Modal */}
      <Modal
        isOpen={Boolean(selectedGoal)}
        onClose={() => setSelectedGoal(null)}
        title={`Deposit into "${selectedGoal?.name}"`}
      >
        <form onSubmit={handleAddFundsSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Deposit Amount ({curr})
            </label>
            <input
              type="number"
              step="any"
              required
              min="1"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Note (Optional)
            </label>
            <input
              type="text"
              value={fundNotes}
              onChange={(e) => setFundNotes(e.target.value)}
              placeholder="e.g. Monthly salary savings"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedGoal(null)} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={fundingLoading}>
              Confirm Deposit
            </Button>
          </div>
        </form>
      </Modal>

      <AddSavingsGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchGoals}
      />
    </div>
  );
};

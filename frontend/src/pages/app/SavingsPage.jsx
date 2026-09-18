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
      alert('Failed to add funds.');
    } finally {
      setFundingLoading(false);
    }
  };

  const curr = currency === 'BDT' ? '৳' : '$';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Savings Goals & Targets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Build wealth toward major milestones. Track monthly required contributions to stay on schedule.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>
          New Savings Goal
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
          Loading savings milestones...
        </div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3">
          <Target className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No savings goals yet</h3>
          <p className="text-xs text-slate-500">Create a goal for an emergency fund, new laptop, or travel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const pct = g.progress_percentage;
            const isFinished = pct >= 100;

            return (
              <div
                key={g.id}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">
                        {g.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {g.name}
                      </h3>
                    </div>
                    <Badge variant={isFinished ? 'success' : 'brand'}>
                      {isFinished ? 'Goal Reached!' : `${pct}%`}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold font-mono">
                      <span className="text-slate-900 dark:text-white">
                        {curr} {parseFloat(g.current_amount).toLocaleString()}
                      </span>
                      <span className="text-slate-400">
                        of {curr} {parseFloat(g.target_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta stats */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Target Date:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {g.target_date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Recommended:
                      </span>
                      <span className="font-bold text-brand-600 dark:text-brand-400 font-mono">
                        ~{curr} {parseFloat(g.recommended_monthly_saving).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedGoal(g)}
                  >
                    + Add Funds
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Funds Modal */}
      <Modal
        isOpen={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        title={`Add Savings Funds to ${selectedGoal?.name || ''}`}
      >
        <form onSubmit={handleAddFundsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Deposit Amount (৳)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Freelance bonus transfer"
              value={fundNotes}
              onChange={(e) => setFundNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setSelectedGoal(null)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={fundingLoading}>
              Save Contribution
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

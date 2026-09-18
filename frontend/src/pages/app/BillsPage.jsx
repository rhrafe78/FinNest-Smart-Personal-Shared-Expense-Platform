import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { AddBillModal } from '../../components/modals/AddBillModal';

export const BillsPage = () => {
  const { currency } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchBills = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;

    api.get('/bills/', { params })
      .then((res) => setBills(res.data.results || res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const handleMarkPaid = async (billId) => {
    try {
      await api.post(`/bills/${billId}/mark-paid/`);
      fetchBills();
    } catch (err) {
      alert('Failed to mark bill as paid.');
    }
  };

  const curr = currency === 'BDT' ? '৳' : '$';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recurring Bills & Utilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Never miss rent, Wi-Fi, electricity, or water bill deadlines with automated status tracking.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Recurring Bill
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: '', label: 'All Bills' },
          { id: 'due_soon', label: 'Due Soon (≤ 3 days)' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'paid', label: 'Paid' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
          Loading recurring bills...
        </div>
      ) : bills.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No bills found</h3>
          <p className="text-xs text-slate-500">Record your upcoming utilities and recurring costs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill) => {
            const status = bill.computed_status || bill.status;
            const isPaid = status === 'paid';
            const isOverdue = status === 'overdue';
            const isDueSoon = status === 'due_soon';

            return (
              <div
                key={bill.id}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {bill.household_name ? `Mess: ${bill.household_name}` : 'Personal Bill'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {bill.name}
                      </h3>
                    </div>

                    <Badge
                      variant={
                        isPaid ? 'success' : isOverdue ? 'danger' : isDueSoon ? 'warning' : 'neutral'
                      }
                    >
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {curr} {parseFloat(bill.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">{bill.due_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recurrence:</span>
                      <span className="capitalize text-slate-700 dark:text-slate-300">{bill.recurrence}</span>
                    </div>
                    {bill.responsible_person_detail && (
                      <div className="flex justify-between">
                        <span>Handled by:</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {bill.responsible_person_detail.full_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!isPaid && (
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={CheckCircle2}
                      onClick={() => handleMarkPaid(bill.id)}
                    >
                      Mark as Paid
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddBillModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchBills}
      />
    </div>
  );
};

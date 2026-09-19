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
      alert('বিল পরিশোধিত মার্ক করতে সমস্যা হয়েছে।');
    }
  };

  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '৳';

  const filterTabs = [
    { id: '', label: 'সকল বিল' },
    { id: 'due_soon', label: 'দ্রুত প্রদেয় (≤ ৩ দিন)' },
    { id: 'upcoming', label: 'আসন্ন' },
    { id: 'overdue', label: 'বকেয়া' },
    { id: 'paid', label: 'পরিশোধিত' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            মাসিক ইউটিলিটি ও বিল
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            বাসা ভাড়া, ওয়াই-ফাই, বিদ্যুৎ ও মেসের নিয়মিত বিলের সময়মতো ট্র্যাকিং।
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
          className="text-xs shadow-sm shadow-brand-500/25"
        >
          + নতুন বিল যুক্ত করুন
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs space-y-3">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>বিলের তালিকা লোড হচ্ছে...</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="fin-card p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <CalendarDays className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              কোনো বিল পাওয়া যায়নি
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আপনার বাসা ভাড়া বা ইউটিলিটি বিল যুক্ত করে সময়মতো নোটিফিকেশন পান।
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
              প্রথম বিল যোগ করুন
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bills.map((bill) => {
            const status = bill.computed_status || bill.status;
            const isPaid = status === 'paid';
            const isOverdue = status === 'overdue';
            const isDueSoon = status === 'due_soon';

            return (
              <div
                key={bill.id}
                className="fin-card p-5 sm:p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {bill.household_name ? `মেস: ${bill.household_name}` : 'ব্যক্তিগত বিল'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {bill.name}
                      </h3>
                    </div>

                    <Badge
                      variant={
                        isPaid ? 'success' : isOverdue ? 'danger' : isDueSoon ? 'warning' : 'neutral'
                      }
                      className="text-[11px]"
                    >
                      {isPaid ? 'পরিশোধিত' : isOverdue ? 'বকেয়া' : isDueSoon ? 'জরুরি' : 'আসন্ন'}
                    </Badge>
                  </div>

                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                    {curr} {parseFloat(bill.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>পরিশোধের শেষ তারিখ:</span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">{bill.due_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ধরণ:</span>
                      <span className="capitalize text-slate-700 dark:text-slate-300">
                        {bill.recurrence === 'monthly' ? 'মাসিক' : bill.recurrence === 'yearly' ? 'বাৎসরিক' : 'এককালীন'}
                      </span>
                    </div>
                    {bill.responsible_person_detail && (
                      <div className="flex justify-between">
                        <span>দায়িত্বে:</span>
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
                      className="w-full text-xs"
                      icon={CheckCircle2}
                      onClick={() => handleMarkPaid(bill.id)}
                    >
                      পরিশোধিত হিসেবে মার্ক করুন
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

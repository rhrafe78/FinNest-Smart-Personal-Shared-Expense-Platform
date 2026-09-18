import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Download,
  Plus,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Trash2,
  Home,
  Users,
  Edit2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { AddExpenseModal } from '../../components/modals/AddExpenseModal';
import { AddIncomeModal } from '../../components/modals/AddIncomeModal';
import { AddSharedExpenseModal } from '../../components/modals/AddSharedExpenseModal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';

export const TransactionsPage = () => {
  const { currency } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState(''); // '', 'income', 'expense', 'shared_expense'
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSharedExpenseModal, setShowSharedExpenseModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTxTarget, setDeleteTxTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEdit = (tx) => {
    setEditItem(tx);
    if (tx.type === 'income') {
      setShowIncomeModal(true);
    } else if (tx.type === 'expense') {
      setShowExpenseModal(true);
    }
  };

  const fetchTransactions = () => {
    setLoading(true);
    const params = {};
    if (filterType) params.type = filterType;
    if (filterCategory) params.category = filterCategory;
    if (search) params.search = search;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    api.get('/personal/transactions/', { params })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setTransactions(list);
      })
      .catch((err) => {
        console.error(err);
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
    api.get('/personal/categories/')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, [filterType, filterCategory, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await api.get('/analytics/export/transactions/', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finnest_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV. Please check network and try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = (tx) => {
    setDeleteTxTarget(tx);
  };

  const confirmDeleteTx = async () => {
    if (!deleteTxTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTxTarget.type === 'income') {
        await api.delete(`/personal/incomes/${deleteTxTarget.id}/`);
      } else if (deleteTxTarget.type === 'expense') {
        await api.delete(`/personal/expenses/${deleteTxTarget.id}/`);
      } else if (deleteTxTarget.type === 'shared_expense') {
        await api.delete(`/households/expenses/${deleteTxTarget.id}/`);
      }
      setDeleteTxTarget(null);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.detail || 'লেনদেন মুছে ফেলতে সমস্যা হয়েছে।');
    } finally {
      setDeleteLoading(false);
    }
  };

  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '৳';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            দৈনিক খরচ, আয় ও হিস্ট্রি (Transactions & Ledger)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ব্যক্তিগত আয়-ব্যয় এবং শেয়ার্ড মেসের সব খরচের সম্পূর্ণ সময়ানুক্রমিক লেজার হিস্ট্রি।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            isLoading={exporting}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setShowIncomeModal(true)}
            className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 font-bold"
          >
            + আয় যোগ
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setShowExpenseModal(true)}
            className="font-bold"
          >
            + ব্যক্তিগত খরচ
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowSharedExpenseModal(true)}
            className="font-bold shadow-md shadow-brand-500/20"
          >
            + মেসের খরচ
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search merchant, mess title, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
            >
              <option value="">সব ধরনের হিসাব (All)</option>
              <option value="income">শুধুমাত্র আয় (+ Incomes)</option>
              <option value="expense">ব্যক্তিগত খরচ (- Expenses)</option>
              <option value="shared_expense">মেসের শেয়ার্ড খরচ (Shared Mess)</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white max-w-[140px]"
            >
              <option value="">সকল ক্যাটাগরি</option>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              title="From Date"
            />
            <span className="text-xs text-slate-400">থেকে</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              title="To Date"
            />

            <Button type="submit" variant="secondary" size="sm">
              সার্চ করুন
            </Button>
          </div>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm animate-pulse space-y-2">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>লোড হচ্ছে... হিস্ট্রি আনা হচ্ছে...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                কোনো লেনদেন পাওয়া যায়নি (No Transactions)
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার অ্যাকাউন্ট একদম ফ্রেশ! আয়, ব্যক্তিগত খরচ বা মেসের খরচ যোগ করতে নিচের বাটনে ক্লিক করুন।
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowIncomeModal(true)}>
                + আয় যোগ করুন
              </Button>
              <Button variant="secondary" size="sm" icon={Plus} onClick={() => setShowExpenseModal(true)}>
                + ব্যক্তিগত খরচ লিখুন
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowSharedExpenseModal(true)}>
                + মেসের খরচ লিখুন
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Title / Description</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Method / Paid By</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Receipt</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(transactions || []).map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isShared = tx.type === 'shared_expense';

                  return (
                    <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                              : isShared
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/60'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                          }`}>
                            {isIncome ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : isShared ? (
                              <Home className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="truncate max-w-[220px] font-bold">{tx.title}</div>
                            {tx.notes && <div className="text-[11px] text-slate-400 font-normal truncate max-w-[220px]">{tx.notes}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isIncome ? 'success' : isShared ? 'brand' : 'danger'}>
                          {isIncome ? 'Income' : isShared ? 'Shared Mess' : 'Personal'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category_color || '#6366f1' }} />
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {tx.payment_method}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {tx.date}
                      </td>
                      <td className={`py-3.5 px-4 font-mono font-bold text-right text-sm ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isShared
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        <div>
                          {isIncome ? '+' : '-'}{curr} {parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        {isShared && tx.user_share && tx.user_share !== tx.amount && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            ভাগ: {curr} {parseFloat(tx.user_share).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {tx.receipt ? (
                          <a href={tx.receipt} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline inline-flex items-center gap-1 font-semibold">
                            <FileText className="w-3.5 h-3.5" /> View
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {tx.type !== 'shared_expense' && (
                            <button
                              onClick={() => handleEdit(tx)}
                              className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded transition-colors"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(tx)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddIncomeModal
        isOpen={showIncomeModal}
        editIncome={editItem?.type === 'income' ? editItem : null}
        onClose={() => {
          setShowIncomeModal(false);
          setEditItem(null);
        }}
        onSuccess={fetchTransactions}
      />
      <AddExpenseModal
        isOpen={showExpenseModal}
        editExpense={editItem?.type === 'expense' ? editItem : null}
        onClose={() => {
          setShowExpenseModal(false);
          setEditItem(null);
        }}
        onSuccess={fetchTransactions}
      />
      <AddSharedExpenseModal
        isOpen={showSharedExpenseModal}
        onClose={() => setShowSharedExpenseModal(false)}
        onSuccess={fetchTransactions}
      />

      {/* In-App Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTxTarget)}
        onClose={() => setDeleteTxTarget(null)}
        onConfirm={confirmDeleteTx}
        loading={deleteLoading}
        title={deleteTxTarget?.type === 'income' ? 'আয় মুছে ফেলতে চান?' : 'খরচ মুছে ফেলতে চান?'}
        message={
          deleteTxTarget?.title
            ? `আপনি কি নিশ্চিত যে "${deleteTxTarget.title}" লেনদেনটি মুছে ফেলতে চান?`
            : 'আপনি কি নিশ্চিত যে এই লেনদেনটি মুছে ফেলতে চান?'
        }
      />
    </div>
  );
};

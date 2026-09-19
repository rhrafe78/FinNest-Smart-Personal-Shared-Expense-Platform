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
  Edit2,
  Calendar,
  X,
  SlidersHorizontal
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

  const handleClearFilters = () => {
    setFilterType('');
    setFilterCategory('');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setShowAdvancedFilters(false);
  };

  const hasActiveAdvancedFilters = Boolean(filterCategory || startDate || endDate);

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
      alert('Failed to download CSV. Please try again.');
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
      alert(err.response?.data?.detail || 'Failed to delete transaction.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '৳';

  const filterTabs = [
    { label: 'All Transactions', value: '' },
    { label: 'Personal Expenses', value: 'expense' },
    { label: 'Income', value: 'income' },
    { label: 'Shared Mess', value: 'shared_expense' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions & Expense Ledger
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete chronological record of your personal income, expenses, and shared mess ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            isLoading={exporting}
            onClick={handleExportCSV}
            className="text-xs"
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setShowIncomeModal(true)}
            className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            + Income
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setShowExpenseModal(true)}
            className="text-xs"
          >
            + Expense
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowSharedExpenseModal(true)}
            className="text-xs shadow-sm shadow-brand-500/25"
          >
            + Shared Expense
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="fin-card p-4 sm:p-5 space-y-4">
        {/* Row 1: Segmented Pills + Search + Filter Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Segmented Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {filterTabs.map((tab) => {
              const isActive = filterType === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilterType(tab.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar & Advanced Filter Toggle */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search merchant or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchTransactions();
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                showAdvancedFilters || hasActiveAdvancedFilters
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              title="Filter options"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveAdvancedFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-600" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All Categories</option>
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  End Date
                </label>
                {hasActiveAdvancedFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions Feed */}
      <div className="fin-card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-3">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No transactions found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your transaction ledger is completely clean. Use the buttons below to record your first income or expense.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowIncomeModal(true)}>
                + Income
              </Button>
              <Button variant="secondary" size="sm" icon={Plus} onClick={() => setShowExpenseModal(true)}>
                + Personal Expense
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowSharedExpenseModal(true)}>
                + Shared Expense
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isShared = tx.type === 'shared_expense';

              return (
                <div
                  key={`${tx.type}-${tx.id}`}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Left: Icon & Title */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : isShared
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2]" />
                      ) : isShared ? (
                        <Home className="w-5 h-5 stroke-[2]" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {tx.title}
                        </span>
                        {isShared && (
                          <Badge variant="brand" className="text-[10px] py-0 px-2">
                            Shared
                          </Badge>
                        )}
                        {tx.receipt && (
                          <a
                            href={tx.receipt}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
                            title="View Receipt"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {tx.category && (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: tx.category_color || '#6366f1' }}
                            />
                            {tx.category}
                          </span>
                        )}
                        <span>•</span>
                        <span className="capitalize">{tx.payment_method?.replace('_', ' ') || 'Cash'}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-bold font-mono tabular-nums tracking-tight ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isShared
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{curr} {parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {isShared && tx.user_share && tx.user_share !== tx.amount && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          Your share: {curr} {parseFloat(tx.user_share).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>

                    {/* Inline Actions (visible on hover) */}
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {tx.type !== 'shared_expense' && (
                        <button
                          type="button"
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(tx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
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

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTxTarget)}
        onClose={() => setDeleteTxTarget(null)}
        onConfirm={confirmDeleteTx}
        loading={deleteLoading}
        title={deleteTxTarget?.type === 'income' ? 'Delete Income Transaction?' : 'Delete Expense?'}
        message={
          deleteTxTarget?.title
            ? `Are you sure you want to delete "${deleteTxTarget.title}"? This record cannot be recovered.`
            : 'Are you sure you want to delete this transaction?'
        }
      />
    </div>
  );
};

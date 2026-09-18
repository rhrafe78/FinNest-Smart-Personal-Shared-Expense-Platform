import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  PieChart as PieIcon,
  TrendingUp,
  FileSpreadsheet,
  Building
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export const AnalyticsPage = () => {
  const { currency } = useAuth();
  const [data, setData] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [selectedHhId, setSelectedHhId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard/'),
      api.get('/households/'),
    ])
      .then(([dashRes, hhRes]) => {
        setData(dashRes.data);
        const hhList = hhRes.data.results || hhRes.data;
        setHouseholds(hhList);
        if (hhList.length > 0) setSelectedHhId(hhList[0].id);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const [exportingPersonal, setExportingPersonal] = useState(false);
  const [exportingHousehold, setExportingHousehold] = useState(false);

  const handleExportPersonal = async () => {
    setExportingPersonal(true);
    try {
      const res = await api.get('/analytics/export/transactions/', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `personal_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExportingPersonal(false);
    }
  };

  const handleExportHousehold = async () => {
    if (!selectedHhId) return;
    setExportingHousehold(true);
    try {
      const res = await api.get(`/analytics/export/household/?household=${selectedHhId}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `household_mess_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export household report.');
    } finally {
      setExportingHousehold(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
        Loading financial analytics and reports...
      </div>
    );
  }

  const curr = currency === 'BDT' ? '৳' : '$';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Multi-dimensional personal wealth and household mess expenditure analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleExportPersonal}>
            Export Personal CSV
          </Button>
          {households.length > 0 && (
            <Button variant="primary" size="sm" icon={Download} onClick={handleExportHousehold}>
              Export Mess Report
            </Button>
          )}
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Trends Area Chart */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cashflow Accumulation (Area)
              </h3>
              <p className="text-xs text-slate-500">Income vs Net Savings</p>
            </div>
            <Badge variant="brand">Monthly</Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_trends}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Income" />
                <Area type="monotone" dataKey="savings" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Savings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Expense Categories Breakdown */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Spending Breakdown
            </h3>
            <p className="text-xs text-slate-500">Distribution across major expense categories</p>
          </div>

          <div className="space-y-4 pt-2">
            {(data.category_breakdown || []).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                এখনও কোনো ব্যয়ের রেকর্ড নেই (No category expenses logged yet)
              </div>
            ) : (
              (data.category_breakdown || []).map((c) => {
              const totalExp = parseFloat(data.total_expense) || 1;
              const pct = ((c.amount / totalExp) * 100).toFixed(1);

              return (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {curr} {c.amount.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      </div>

      {/* Household Mess Report Export Section */}
      {households.length > 0 && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Export Household Mess Expense Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Generate CSV statements containing every split, member contribution, and description.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedHhId}
                onChange={(e) => setSelectedHhId(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {households.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>

              <Button variant="primary" size="sm" icon={Download} onClick={handleExportHousehold}>
                Download CSV
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  PieChart as PieIcon,
  TrendingUp,
  FileSpreadsheet,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
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
      alert('ব্যক্তিগত CSV এক্সপোর্ট করা সম্ভব হয়নি।');
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
      alert('মেস রিপোর্ট ডাউনলোড করা যায়নি।');
    } finally {
      setExportingHousehold(false);
    }
  };

  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '৳';

  if (loading || !data) {
    return (
      <div className="p-16 text-center text-slate-400 text-xs space-y-3">
        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>অ্যানালিটিক্স চার্ট লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            আর্থিক অ্যানালিটিক্স ও রিপোর্ট
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            আপনার মাসিক আয়-ব্যয়ের প্রবাহ ও ক্যাটাগরিভিত্তিক খরচের সম্পূর্ণ ভিজ্যুয়াল বিশ্লেষণ।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportPersonal}
            isLoading={exportingPersonal}
            className="text-xs"
          >
            ব্যক্তিগত CSV ডাউনলোড
          </Button>
          {households.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleExportHousehold}
              isLoading={exportingHousehold}
              className="text-xs shadow-sm shadow-brand-500/25"
            >
              মেস রিপোর্ট
            </Button>
          )}
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Trends Area Chart */}
        <div className="fin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                মাসিক আয় ও সঞ্চয়ের ট্রেন্ড
              </h3>
              <p className="text-xs text-slate-400">প্রতি মাসে কত আয় এবং কত উদ্বৃত্ত সঞ্চয় হয়েছে</p>
            </div>
            <Badge variant="brand" className="text-xs">মাসিক হিসাব</Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_trends}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="মোট আয়" />
                <Area type="monotone" dataKey="savings" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="নেট সঞ্চয়" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Expense Categories Breakdown */}
        <div className="fin-card p-6 space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ক্যাটাগরিভিত্তিক খরচের ভাগ
            </h3>
            <p className="text-xs text-slate-400">কোথায় কত শতাংশ টাকা খরচ হয়েছে</p>
          </div>

          <div className="space-y-4 pt-2">
            {(data.category_breakdown || []).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                এখনও কোনো ব্যয়ের রেকর্ড নেই
              </div>
            ) : (
              (data.category_breakdown || []).map((c) => {
                const totalExp = parseFloat(data.total_expense) || 1;
                const pct = ((c.amount / totalExp) * 100).toFixed(1);

                return (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                      <span className="font-mono tabular-nums text-slate-900 dark:text-white font-semibold">
                        {curr} {c.amount.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Household Mess Report Export Section */}
      {households.length > 0 && (
        <div className="fin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              মেসের সম্পূর্ণ খরচের খতিয়ান এক্সপোর্ট
            </h3>
            <p className="text-xs text-slate-400">
              মেসের প্রতিটি বাজার, বিল এবং মেম্বারদের টাকার পূর্ণাঙ্গ স্টেটমেন্ট CSV ফরম্যাটে সেভ করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={selectedHhId}
              onChange={(e) => setSelectedHhId(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleExportHousehold}
              isLoading={exportingHousehold}
              className="text-xs shadow-sm shadow-brand-500/25"
            >
              ডাউনলোড CSV
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

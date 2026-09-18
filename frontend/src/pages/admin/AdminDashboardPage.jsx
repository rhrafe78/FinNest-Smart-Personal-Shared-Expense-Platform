import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Home,
  DollarSign,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Tags,
  Settings,
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';
import api from '../../api/client';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/platform-admin/stats/');
      setStats(res.data);
    } catch (err) {
      setError('Failed to fetch platform administrator metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Platform Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global metrics, user growth, and system configuration oversight
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-xs font-bold w-fit">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>System Status: {stats?.system_status || 'Operational'}</span>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {stats?.total_users || 0}
          </div>
          <p className="text-[11px] text-slate-500">
            {stats?.verified_users} verified accounts ({stats?.staff_users} staff admins)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Households</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {stats?.total_households || 0}
          </div>
          <p className="text-[11px] text-slate-500">
            Active mess & shared living apartments
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            ৳{Number(stats?.total_transactions_volume || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Across personal & shared mess ledgers
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shared Volume</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            ৳{Number(stats?.shared_expense_total || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Processed via splitting & settlements
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-900/50 hover:border-indigo-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                  User Management
                </h3>
                <p className="text-xs text-slate-400">Manage all registered accounts</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/households"
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-950 border border-amber-900/40 hover:border-amber-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-lg shadow-amber-600/30">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  Household Oversight
                </h3>
                <p className="text-xs text-slate-400">Monitor mess & shared accounts</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/categories"
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 to-slate-950 border border-purple-900/40 hover:border-purple-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                  System Categories
                </h3>
                <p className="text-xs text-slate-400">Add/edit global categories</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Registrations Table */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Registrations</h3>
            <p className="text-xs text-slate-400">Latest users signed up on the platform</p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View All Users →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {stats?.recent_users?.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {u.full_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold">
                      {u.profile?.currency || 'BDT'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {u.is_staff ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold text-[10px]">
                        Admin
                      </span>
                    ) : (
                      <span className="text-slate-400">User</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(u.date_joined).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

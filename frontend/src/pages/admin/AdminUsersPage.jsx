import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldAlert,
  Trash2,
  Power,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import api from '../../api/client';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/platform-admin/users/?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user, field) => {
    setActionLoadingId(user.id);
    setMessage('');
    try {
      const payload = { [field]: !user[field] };
      const res = await api.patch(`/platform-admin/users/${user.id}/`, payload);
      setUsers(users.map((u) => (u.id === user.id ? { ...u, ...payload } : u)));
      setMessage(`Updated ${user.email} successfully.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${user.email}? This will erase all personal ledgers and memberships.`)) {
      return;
    }

    setActionLoadingId(user.id);
    setMessage('');
    try {
      await api.delete(`/platform-admin/users/${user.id}/`);
      setUsers(users.filter((u) => u.id !== user.id));
      setMessage(`User ${user.email} was permanently deleted.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            User Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage all registered platform accounts, verification states, and administrative roles
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {message && (
        <div className="p-3 text-xs bg-emerald-950/60 text-emerald-300 rounded-xl border border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Controls: Search + Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
        </form>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'verified', label: 'Verified' },
            { id: 'unverified', label: 'Unverified' },
            { id: 'staff', label: 'Staff Admins' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No users match your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => {
                  const isActionLoading = actionLoadingId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-xs">
                            {u.first_name?.[0] || u.email[0].toUpperCase()}
                          </div>
                          <span className="font-bold text-white">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleToggleStatus(u, 'is_verified')}
                          title="Click to toggle verified status"
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] transition-all cursor-pointer ${
                            u.is_verified
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                              : 'bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900'
                          }`}
                        >
                          {u.is_verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {u.is_verified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleToggleStatus(u, 'is_active')}
                          title="Click to toggle account activation"
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] transition-all cursor-pointer ${
                            u.is_active
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {u.is_active ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleToggleStatus(u, 'is_staff')}
                          title="Click to toggle Admin / Staff privilege"
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] transition-all cursor-pointer ${
                            u.is_staff
                              ? 'bg-indigo-950 text-indigo-400 border border-indigo-800 hover:bg-indigo-900'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {u.is_staff ? 'Admin' : 'User'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold">
                          {u.currency}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(u.date_joined).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleDeleteUser(u)}
                          title="Permanently delete user"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

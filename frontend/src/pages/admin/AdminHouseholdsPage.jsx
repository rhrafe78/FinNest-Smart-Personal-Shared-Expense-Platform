import React, { useState, useEffect } from 'react';
import { Home, Users, DollarSign, Key, RefreshCw, Layers } from 'lucide-react';
import api from '../../api/client';

export const AdminHouseholdsPage = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/platform-admin/households/');
      setHouseholds(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Home className="w-6 h-6 text-amber-400" />
            Household & Mess Oversight
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global monitoring of all bachelor messes, roommates, and shared living expense groups
          </p>
        </div>

        <button
          onClick={fetchHouseholds}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Households Table */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : households.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Home className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No households created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Household Name</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4">Expenses Count</th>
                  <th className="py-3 px-4">Total Shared Volume</th>
                  <th className="py-3 px-4">Invite Code</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {households.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                        <Home className="w-4 h-4" />
                      </div>
                      <span>{h.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-200">{h.owner.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{h.owner.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        <Users className="w-3 h-3 text-indigo-400" />
                        {h.members_count} members
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-mono">
                        {h.expenses_count} expenses
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-400 font-mono">
                        ৳{Number(h.total_volume).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
                        {h.invite_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Settings, Server, Mail, Shield, Database, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminSettingsPage = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = () => {
    setSavedMessage('Platform settings saved successfully.');
    setTimeout(() => setSavedMessage(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Platform Settings & Infrastructure
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Server configurations, outgoing mail relays, security thresholds, and system health
        </p>
      </div>

      {savedMessage && (
        <div className="p-3 text-xs bg-emerald-950/60 text-emerald-300 rounded-xl border border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Infrastructure Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outgoing Mail */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Gateway (SMTP)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-[10px]">
              Active & Connected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white font-mono">thefinnest22@gmail.com</p>
              <p className="text-[11px] text-slate-400">Host: smtp.gmail.com:587 (TLS Enabled)</p>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Engine</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-[10px]">
              Connected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Dual-Mode Relational DB</p>
              <p className="text-[11px] text-slate-400">SQLite (Local Dev) / PostgreSQL (Production ready)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Authentication Policies Card */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Real Database Authentication Policies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">OTP Code Lifetime</p>
            <p className="text-xl font-bold text-white font-mono mt-1">10 Minutes</p>
            <p className="text-[10px] text-slate-500 mt-1">Auto-expires unverified database tokens</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Max Verification Tries</p>
            <p className="text-xl font-bold text-white font-mono mt-1">5 Attempts</p>
            <p className="text-[10px] text-slate-500 mt-1">Anti brute-force invalidation</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Token Architecture</p>
            <p className="text-xl font-bold text-white font-mono mt-1">SimpleJWT HS256</p>
            <p className="text-[10px] text-slate-500 mt-1">1-day Access, 30-day Refresh rotation</p>
          </div>
        </div>
      </div>

      {/* Platform Maintenance Mode Card */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">System Maintenance Toggle</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Temporarily prevent new user registrations during maintenance windows
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              maintenanceMode ? 'bg-amber-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
          </button>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSave}
            className="font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

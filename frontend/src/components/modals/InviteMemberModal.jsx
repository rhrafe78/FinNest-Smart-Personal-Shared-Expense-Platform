import React, { useState } from 'react';
import { Copy, Check, Mail } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import api from '../../api/client';

export const InviteMemberModal = ({ isOpen, onClose, household, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleCopyCode = () => {
    if (household?.invite_code) {
      navigator.clipboard.writeText(household.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    if (!email.trim()) return;

    setLoading(true);
    try {
      // First attempt to add the member directly to the mess
      await api.post(`/households/${household.id}/add-member/`, { identifier: email.trim() });
      setMsg({ text: `Successfully added member to household!`, type: 'success' });
      setEmail('');
      onSuccess?.();
    } catch (err) {
      // If user not found, send invite record
      if (err.response?.status === 404) {
        try {
          await api.post(`/households/${household.id}/invite/`, { email: email.trim() });
          setMsg({ text: `Invitation created. Share the code with your roommate.`, type: 'success' });
          setEmail('');
          onSuccess?.();
        } catch (inviteErr) {
          setMsg({
            text: inviteErr.response?.data?.detail || 'Failed to add member.',
            type: 'error',
          });
        }
      } else {
        setMsg({
          text: err.response?.data?.detail || 'Failed to add member.',
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite Member to ${household?.name || 'Household'}`}>
      <div className="space-y-5">
        {/* Invite Code Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Household Join Code (Share with Roommates)
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-base font-bold text-center tracking-widest text-brand-600 dark:text-brand-400 select-all">
              {household?.invite_code || '------'}
            </div>
            <Button
              variant="secondary"
              onClick={handleCopyCode}
              type="button"
              className="px-4 py-3"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Roommates can join directly by clicking "Join Household" on their dashboard and pasting this code.
          </p>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-xs uppercase font-bold text-slate-400">Or send email</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Email Invite Form */}
        <form onSubmit={handleSendInvite} className="space-y-3">
          {msg.text && (
            <div
              className={`p-3 text-xs rounded-xl border ${
                msg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200'
              }`}
            >
              {msg.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Roommate Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit" isLoading={loading}>
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

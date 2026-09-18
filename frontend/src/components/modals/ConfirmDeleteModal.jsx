import React from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'মুছে ফেলতে চান?',
  message = 'আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান? এই তথ্যটি আর ফিরিয়ে আনা যাবে না।',
  confirmText = 'হ্যাঁ, মুছে ফেলুন',
  cancelText = 'বাতিল করুন',
  loading = false,
  danger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={!loading ? onClose : undefined}
      />

      {/* In-App Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden z-10 p-6 text-center transform transition-all scale-100 animate-in zoom-in-95 duration-150">
        {/* Close Icon */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Warning Icon Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 ring-8 ring-rose-500/5">
          {danger ? (
            <Trash2 className="w-7 h-7 stroke-[2.2]" />
          ) : (
            <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-center">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 hover:shadow-rose-600/35 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>মুছছি...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

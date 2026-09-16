import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export function ConfirmModal({ isOpen, onClose, onConfirm, job, loading }) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Delete Job</h3>
            <p className="text-xs text-slate-400 font-mono">Irreversible database delete</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 my-4 bg-[#0c121e] p-3 rounded-lg border border-[#1f293d] leading-relaxed">
          Are you sure you want to delete job <span className="font-semibold text-white">"{job.title}"</span> (<code className="text-blue-400 font-mono">{job.id}</code>)? All associated transition audit history will also be permanently deleted.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f293d]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

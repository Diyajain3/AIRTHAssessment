import React, { useEffect, useState } from 'react';
import { X, History, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export function JobHistoryModal({ job, isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!job || !isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError('');

    api.getJobLogs(job.id)
      .then((res) => {
        if (isMounted) setLogs(res.data || []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load logs');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [job, isOpen]);

  if (!isOpen || !job) return null;

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' · ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'text-[#4ade80] bg-[#062419] border-[#166534]/50';
      case 'running': return 'text-[#60a5fa] bg-[#0c1f38] border-[#1d4ed8]/50';
      case 'pending': return 'text-[#fbbf24] bg-[#281f0b] border-[#854d0e]/50';
      case 'failed': return 'text-[#f87171] bg-[#2b1015] border-[#991b1b]/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-[#1e293b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Transition Audit Trail</h3>
            <p className="text-xs text-slate-400 font-mono">{job.id} · {job.title}</p>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400 mb-2" />
              <span className="text-xs font-mono">Loading audit trail...</span>
            </div>
          ) : error ? (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-mono">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-mono">
              No audit records found.
            </div>
          ) : (
            <div className="relative border-l border-slate-800 ml-3 space-y-3 py-1">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-5">
                  <span className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#111827]"></span>

                  <div className="p-3 rounded-lg bg-[#0c121e] border border-[#1f293d] font-mono text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      {log.fromStatus ? (
                        <>
                          <span className={`px-2 py-0.2 rounded text-[10px] border ${getStatusBadge(log.fromStatus)}`}>
                            {log.fromStatus}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 uppercase">Created</span>
                      )}
                      <span className={`px-2 py-0.2 rounded text-[10px] border ${getStatusBadge(log.toStatus)}`}>
                        {log.toStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans mt-1">{log.details}</p>

                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#1f293d] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

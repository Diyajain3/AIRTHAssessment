import React from 'react';
import { Trash2, History, AlertCircle, RefreshCw, Plus, ArrowRight, Loader2 } from 'lucide-react';

export function JobList({
  jobs,
  loading,
  error,
  onRetry,
  onOpenCreate,
  onUpdateStatus,
  onDeleteJob,
  onViewHistory,
  updatingId,
  activeFilter
}) {
  // Format relative timestamp like in Figma (e.g., '56m ago', '2h ago', '3d ago')
  const formatTimeAgo = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDay = Math.floor(diffHour / 24);
      return `${diffDay}d ago`;
    } catch {
      return 'just now';
    }
  };

  // Format job type to badge style (lowercase like in screenshot: 'email', 'report', 'export', 'import', 'sync')
  const getTypeBadge = (type) => {
    const cleanType = (type || 'custom').toLowerCase().replace(/_/g, ' ');
    let colorClass = 'bg-[#1e293b] text-slate-300 border-[#334155]';

    if (cleanType.includes('email')) {
      colorClass = 'bg-[#1e2337] text-[#93c5fd] border-[#1d4ed8]/30';
    } else if (cleanType.includes('report')) {
      colorClass = 'bg-[#261f36] text-[#c084fc] border-[#7e22ce]/30';
    } else if (cleanType.includes('export') || cleanType.includes('data')) {
      colorClass = 'bg-[#292218] text-[#fcd34d] border-[#b45309]/30';
    } else if (cleanType.includes('sync')) {
      colorClass = 'bg-[#172822] text-[#6ee7b7] border-[#047857]/30';
    } else if (cleanType.includes('image') || cleanType.includes('import')) {
      colorClass = 'bg-[#162933] text-[#67e8f9] border-[#0e7490]/30';
    }

    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono border ${colorClass}`}>
        {cleanType}
      </span>
    );
  };

  // Status badge matching screenshot with colored dot
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#062419] text-[#4ade80] border border-[#166534]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
            <span>completed</span>
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#0c1f38] text-[#60a5fa] border border-[#1d4ed8]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse"></span>
            <span>running</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#281f0b] text-[#fbbf24] border border-[#854d0e]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
            <span>pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#2b1015] text-[#f87171] border border-[#991b1b]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
            <span>failed</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Error state
  if (error && jobs.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-[#111827] border border-rose-900/50 text-center my-6">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-white">Connection Error</h3>
        <p className="text-xs text-rose-400 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Loading skeleton
  if (loading && jobs.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f293d] bg-[#111827] overflow-hidden my-4">
        <div className="divide-y divide-[#1f293d]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
              <div className="w-20 h-4 bg-slate-800 rounded"></div>
              <div className="w-48 h-4 bg-slate-800 rounded"></div>
              <div className="w-16 h-4 bg-slate-800 rounded"></div>
              <div className="w-24 h-4 bg-slate-800 rounded"></div>
              <div className="w-16 h-4 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="p-12 rounded-xl border border-[#1f293d] bg-[#111827] text-center my-4">
        <p className="text-sm text-slate-400">
          {activeFilter !== 'all'
            ? `No jobs found with status '${activeFilter}'.`
            : 'No jobs in queue yet.'}
        </p>
        <button
          onClick={onOpenCreate}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Job</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1f293d] bg-[#111827] overflow-hidden my-3 shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f293d] text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider bg-[#0c121e]/80">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">TITLE</th>
              <th className="py-3 px-4">TYPE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">CREATED</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f293d] text-xs">
            {jobs.map((job) => {
              const isUpdating = updatingId === job.id;
              // Normalize id for display (e.g., job_sample_01 -> SAMPLE01 or last 8 chars)
              const displayId = job.id.replace('job_', '').slice(0, 8).toUpperCase();

              return (
                <tr
                  key={job.id}
                  className="hover:bg-[#161f30]/60 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-xs font-medium whitespace-nowrap">
                    {displayId}
                  </td>

                  {/* TITLE */}
                  <td className="py-3.5 px-4 text-slate-200 font-medium max-w-xs sm:max-w-sm truncate">
                    {job.title}
                  </td>

                  {/* TYPE */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getTypeBadge(job.type)}
                  </td>

                  {/* STATUS */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(job.status)}
                  </td>

                  {/* CREATED */}
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">
                    {formatTimeAgo(job.createdAt)}
                  </td>

                  {/* ACTIONS matching Figma screenshot */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      {/* When Pending: -> running and -> failed */}
                      {job.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(job.id, 'running', { expectedCurrentStatus: 'pending' })}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-[#60a5fa] border border-[#3b82f6]/40 hover:bg-[#1d4ed8]/20 transition-colors disabled:opacity-50"
                            title="Start running job"
                          >
                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>&rarr; running</span>}
                          </button>
                          <button
                            onClick={() => onUpdateStatus(job.id, 'failed', { expectedCurrentStatus: 'pending' })}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-[#f87171] border border-[#ef4444]/40 hover:bg-[#991b1b]/20 transition-colors disabled:opacity-50"
                            title="Mark job failed"
                          >
                            <span>&rarr; failed</span>
                          </button>
                        </>
                      )}

                      {/* When Running: -> completed and -> failed */}
                      {job.status === 'running' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(job.id, 'completed', { expectedCurrentStatus: 'running' })}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-[#4ade80] border border-[#22c55e]/40 hover:bg-[#15803d]/20 transition-colors disabled:opacity-50"
                            title="Complete job"
                          >
                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>&rarr; completed</span>}
                          </button>
                          <button
                            onClick={() => onUpdateStatus(job.id, 'failed', { expectedCurrentStatus: 'running' })}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-[#f87171] border border-[#ef4444]/40 hover:bg-[#991b1b]/20 transition-colors disabled:opacity-50"
                            title="Mark job failed"
                          >
                            <span>&rarr; failed</span>
                          </button>
                        </>
                      )}

                      {/* Transition audit trail button */}
                      <button
                        onClick={() => onViewHistory(job)}
                        className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
                        title="View state history"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete trash icon */}
                      <button
                        onClick={() => onDeleteJob(job)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

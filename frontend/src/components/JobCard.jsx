import React from 'react';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  History,
  Lock,
  Zap,
  Loader2
} from 'lucide-react';

export function JobCard({
  job,
  onUpdateStatus,
  onDeleteJob,
  onViewHistory,
  onSimulateRace,
  updatingId
}) {
  const isUpdating = updatingId === job.id;

  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      dotColor: 'bg-amber-600'
    },
    running: {
      label: 'Running',
      icon: PlayCircle,
      badgeBg: 'bg-crimson-100 text-crimson-900 border-crimson-300',
      dotColor: 'bg-crimson-700 animate-pulse'
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      dotColor: 'bg-emerald-600'
    },
    failed: {
      label: 'Failed',
      icon: XCircle,
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      dotColor: 'bg-rose-600'
    }
  };

  const status = statusConfig[job.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' · ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="group relative p-5 rounded-2xl bg-white border border-cream-300 hover:border-earth-400 transition-all duration-200 shadow-soft hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.badgeBg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{status.label}</span>
            </span>

            {/* Job Type Tag */}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cream-200 text-earth-800 border border-cream-300">
              {job.type}
            </span>

            {/* OCC Version */}
            <span
              className="text-[10px] font-mono text-earth-600 px-2 py-0.5 rounded bg-cream-100 border border-cream-300"
              title={`Optimistic Concurrency Control version: ${job.version}`}
            >
              v{job.version}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-serif font-bold text-earth-950 tracking-tight break-words group-hover:text-crimson-800 transition-colors">
            {job.title}
          </h3>

          {/* Meta: ID and Timestamps */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-earth-500 font-medium">
            <span className="font-mono text-earth-500">{job.id}</span>
            <span>Queued: {formatDate(job.createdAt)}</span>
            {job.updatedAt !== job.createdAt && (
              <span className="text-earth-400">Updated: {formatDate(job.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Right: State Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-cream-200">
          {/* Dynamic state machine action buttons */}
          {job.status === 'pending' && (
            <>
              {/* Start Run */}
              <button
                onClick={() => onUpdateStatus(job.id, 'running', { expectedCurrentStatus: 'pending' })}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-crimson-700 hover:bg-crimson-800 text-white shadow-sm transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                title="Transition status to 'running'"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                <span>Start Job</span>
              </button>

              {/* Race Condition Test */}
              <button
                onClick={() => onSimulateRace(job.id)}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all disabled:opacity-50"
                title="Simulate two concurrent tabs racing to change this job"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Test Race</span>
              </button>
            </>
          )}

          {job.status === 'running' && (
            <>
              {/* Mark Completed */}
              <button
                onClick={() => onUpdateStatus(job.id, 'completed', { expectedCurrentStatus: 'running' })}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                title="Transition status to 'completed'"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Complete</span>
              </button>

              {/* Mark Failed */}
              <button
                onClick={() => onUpdateStatus(job.id, 'failed', { expectedCurrentStatus: 'running' })}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shadow-sm transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                title="Transition status to 'failed'"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Fail</span>
              </button>
            </>
          )}

          {(job.status === 'completed' || job.status === 'failed') && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100 border border-cream-300 text-xs font-bold text-earth-500 cursor-not-allowed select-none"
              title="Terminal State: A completed or failed job cannot become running again per assignment specification."
            >
              <Lock className="w-3.5 h-3.5 text-earth-400" />
              <span>Terminal State</span>
            </div>
          )}

          {/* Audit History */}
          <button
            onClick={() => onViewHistory(job)}
            className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-earth-600 hover:text-earth-900 border border-cream-300 transition-colors"
            title="View transition history audit trail"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDeleteJob(job)}
            className="p-2 rounded-xl bg-cream-100 hover:bg-rose-50 text-earth-600 hover:text-rose-700 border border-cream-300 transition-colors"
            title="Delete job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

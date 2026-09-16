import React from 'react';
import { Search, X, Radio } from 'lucide-react';

export function FilterBar({
  activeFilter,
  onSelectFilter,
  counts,
  searchQuery,
  onSearchChange,
  autoRefresh,
  onToggleAutoRefresh
}) {
  const filters = [
    { id: 'all', label: `all (${counts.total || 0})` },
    { id: 'pending', label: `pending (${counts.pending || 0})` },
    { id: 'running', label: `running (${counts.running || 0})` },
    { id: 'completed', label: `completed (${counts.completed || 0})` },
    { id: 'failed', label: `failed (${counts.failed || 0})` },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
      {/* Filter line matching screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono text-xs">
        <span className="text-slate-400 font-normal mr-1">filter:</span>
        <div className="flex items-center gap-2">
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 bg-[#162032] text-white font-medium'
                    : 'border-[#1f293d] bg-[#111827] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Search & Auto-refresh */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-full sm:w-52">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#111827] border border-[#1f293d] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={onToggleAutoRefresh}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
            autoRefresh
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
              : 'border-[#1f293d] bg-[#111827] text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle 3s live auto-refresh"
        >
          <Radio className={`w-3 h-3 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
          <span className="hidden md:inline">3s</span>
        </button>
      </div>
    </div>
  );
}

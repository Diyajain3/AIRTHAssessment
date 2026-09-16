import React from 'react';
import { LayoutGrid, Plus, Menu, User, LogIn, Zap, RefreshCw } from 'lucide-react';

export function Header({
  totalJobs,
  onOpenCreate,
  onOpenConcurrency,
  onToggleSidebar,
  user,
  onOpenAuth,
  onRefresh,
  loading
}) {
  return (
    <header className="border-b border-[#1f293d] bg-[#0b0f17] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: [::] JobQueue / dashboard */}
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg bg-[#111827] border border-[#1f293d] hover:border-slate-600 text-slate-300 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Logo stamp */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1e293b] border border-[#334155] flex items-center justify-center text-blue-400 shadow-sm">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div className="flex items-center text-sm font-sans">
              <span className="font-bold text-white tracking-tight">JobQueue</span>
              <span className="text-slate-600 mx-1.5 font-light">/</span>
              <span className="text-slate-400 font-normal">dashboard</span>
            </div>
          </div>
        </div>

        {/* Right: X total jobs + New Job + Auth */}
        <div className="flex items-center gap-3.5">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#111827] transition-colors"
            title="Refresh job list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Concurrency Simulator button */}
          <button
            onClick={onOpenConcurrency}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            title="Simulate 2-tab race condition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Race Simulator</span>
          </button>

          {/* Total Jobs Counter (matches screenshot: '8 total jobs') */}
          <span className="text-xs text-slate-400 font-mono font-medium">
            {totalJobs} total jobs
          </span>

          {/* + New Job Button (matches green button in screenshot) */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Job</span>
          </button>

          {/* User Auth trigger */}
          {user ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-lg bg-[#111827] border border-[#1f293d] hover:border-slate-600 text-xs text-slate-300 transition-colors"
              title={`Logged in as ${user.name}`}
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f293d] hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

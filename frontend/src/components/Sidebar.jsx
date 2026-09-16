import React from 'react';
import {
  LayoutGrid,
  Zap,
  BookOpen,
  User,
  LogOut,
  X,
  Plus,
  Radio,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  LogIn
} from 'lucide-react';

export function Sidebar({
  isOpen,
  onClose,
  activeFilter,
  onSelectFilter,
  counts,
  serverOnline,
  user,
  onOpenAuth,
  onLogout,
  onOpenCreate,
  onOpenConcurrency,
  onOpenRules
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <aside className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c121e] border-r border-[#1f293d] flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-[#1f293d] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1e293b] border border-[#334155] flex items-center justify-center text-blue-400">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white tracking-tight">JobQueue</h2>
                <p className="text-[11px] text-slate-400 font-mono">Control Sidebar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Create CTA */}
          <div className="p-3 border-b border-[#1f293d]">
            <button
              onClick={() => {
                onOpenCreate();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Job</span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-5">
            {/* Status Queues */}
            <div>
              <span className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Queues
              </span>
              <div className="space-y-0.5">
                {[
                  { id: 'all', label: 'All Jobs', count: counts.total || 0, icon: LayoutGrid, color: 'text-slate-400' },
                  { id: 'pending', label: 'Pending', count: counts.pending || 0, icon: Clock, color: 'text-amber-400' },
                  { id: 'running', label: 'Running', count: counts.running || 0, icon: PlayCircle, color: 'text-blue-400' },
                  { id: 'completed', label: 'Completed', count: counts.completed || 0, icon: CheckCircle2, color: 'text-emerald-400' },
                  { id: 'failed', label: 'Failed', count: counts.failed || 0, icon: XCircle, color: 'text-rose-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectFilter(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        isActive
                          ? 'bg-[#1e293b] text-white font-semibold'
                          : 'text-slate-400 hover:bg-[#161f30] hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tools */}
            <div>
              <span className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Engineering Tools
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    onOpenConcurrency();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-amber-400 hover:bg-[#161f30] transition-colors text-left"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Race Simulator</span>
                </button>
                <button
                  onClick={() => {
                    onOpenRules();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:bg-[#161f30] hover:text-slate-200 transition-colors text-left"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Transition Rules</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User profile & Server status footer */}
        <div className="p-3 border-t border-[#1f293d] bg-[#090d16] space-y-2.5">
          {/* Server Connection Status */}
          <div className="flex items-center justify-between px-2 py-1 rounded bg-[#111827] border border-[#1f293d] text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {serverOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                )}
              </span>
              <span className={serverOnline ? 'text-slate-300' : 'text-rose-400'}>
                {serverOnline ? 'API Connected' : 'Disconnected'}
              </span>
            </div>
            <span className="text-slate-500 text-[10px]">:5000</span>
          </div>

          {/* User Auth Info */}
          {user ? (
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

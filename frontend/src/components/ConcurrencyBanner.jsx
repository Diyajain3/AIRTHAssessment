import React from 'react';
import { Zap, Terminal } from 'lucide-react';

export function ConcurrencyBanner({ onOpenConcurrency }) {
  return (
    <div className="p-3.5 rounded-xl bg-[#0f172a]/60 border border-[#1e293b] font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-start sm:items-center gap-2 text-slate-400">
        <span className="text-blue-500 font-bold select-none">//</span>
        <span className="text-slate-500 select-none">Concurrency note:</span>
        <span className="text-slate-300">
          pending &rarr; running &rarr; completed | failed. Terminal states cannot be re-run. Atomic conditional updates resolve race conditions with 409.
        </span>
      </div>
      <button
        onClick={onOpenConcurrency}
        className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#1e293b] hover:bg-[#334155] text-amber-400 border border-[#334155] transition-colors"
      >
        <Zap className="w-3 h-3 text-amber-400" />
        <span>Simulate Race Test</span>
      </button>
    </div>
  );
}

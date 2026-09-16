import React from 'react';

export function StatsOverview({ counts, activeFilter, onSelectFilter }) {
  const cards = [
    {
      id: 'pending',
      label: 'PENDING',
      count: counts.pending || 0,
      dotColor: 'bg-[#eab308]' // amber/yellow
    },
    {
      id: 'running',
      label: 'RUNNING',
      count: counts.running || 0,
      dotColor: 'bg-[#3b82f6]', // blue
      hasPulse: counts.running > 0
    },
    {
      id: 'completed',
      label: 'COMPLETED',
      count: counts.completed || 0,
      dotColor: 'bg-[#22c55e]' // green
    },
    {
      id: 'failed',
      label: 'FAILED',
      count: counts.failed || 0,
      dotColor: 'bg-[#ef4444]' // red
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(card.id === activeFilter ? 'all' : card.id)}
            className={`text-left p-5 rounded-xl bg-[#111827] border transition-all duration-150 ${
              isActive
                ? 'border-blue-500/80 bg-[#162032] shadow-sm ring-1 ring-blue-500/40'
                : 'border-[#1f293d] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-400">
                {card.label}
              </span>
              <div className="relative flex items-center justify-center">
                <span className={`w-2 h-2 rounded-full ${card.dotColor}`}></span>
                {card.hasPulse && (
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
                )}
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-sans font-bold text-white tracking-tight">
                {card.count}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

import React, { useState } from 'react';
import { X, Zap, ShieldCheck, Play, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export function ConcurrencyDemoModal({ isOpen, onClose, pendingJobs, onJobUpdated }) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentJobId = selectedJobId || (pendingJobs[0]?.id || '');

  const handleRunSimulation = async () => {
    setError('');
    setResults(null);
    setSimulating(true);

    try {
      let targetId = currentJobId;

      if (!targetId) {
        const createRes = await api.createJob({
          title: 'Concurrency Benchmark Target',
          type: 'sync'
        });
        targetId = createRes.data.id;
        setSelectedJobId(targetId);
      }

      const res = await api.simulateRace(targetId);
      setResults(res.data);
      if (onJobUpdated) onJobUpdated();
    } catch (err) {
      setError(err.message || 'Simulation encountered an error.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-[#1e293b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Concurrency Studio</h3>
            <p className="text-xs text-slate-400 font-mono">2-Browser-Tabs Race Simulation & OCC Verification</p>
          </div>
        </div>

        {/* Explainer Box */}
        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1f293d] font-mono text-xs space-y-2 mb-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Problem: Tab A & Tab B click 'Start' simultaneously</span>
          </div>
          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            Both tabs read status as <span className="font-mono text-amber-400">pending</span>. The backend resolves the race atomically via:
          </p>
          <code className="block p-2 bg-[#080d14] rounded border border-slate-800 text-[11px] text-blue-300 font-mono overflow-x-auto">
            UPDATE jobs SET status = 'running', version = version + 1 WHERE id = ? AND status = 'pending';
          </code>
          <p className="text-slate-400 font-sans text-xs pt-1">
            Tab 1 touches 1 row &rarr; <strong className="text-emerald-400">200 OK</strong>. Tab 2 touches 0 rows &rarr; <strong className="text-rose-400">409 Conflict</strong>.
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-400 mb-1">
                Target Pending Job:
              </label>
              {pendingJobs.length > 0 ? (
                <select
                  value={currentJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0c121e] border border-[#1f293d] text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                >
                  {pendingJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.id.slice(0, 12)})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-slate-500 font-mono">
                  (Auto-creates test job if none pending)
                </span>
              )}
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Simulate Race</span>
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {results && (
            <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1f293d] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-bold">
                  Simulation Results:
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolved Safely
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.results.map((r, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border font-mono text-xs ${
                      r.status === 200
                        ? 'bg-[#0c1f38] border-[#1d4ed8]/50 text-blue-200'
                        : 'bg-[#2b1015] border-[#991b1b]/50 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{r.requester}</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-bold">
                        {r.status === 200 ? 'HTTP 200' : 'HTTP 409'}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 font-sans leading-tight">
                      {r.status === 200
                        ? `Won race. Transitioned to 'running' (v${r.job?.version || 2}).`
                        : `Rejected by OCC. ${r.error || 'Conflict: job already modified.'}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[#1f293d] flex justify-end">
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

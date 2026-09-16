import React from 'react';
import { X, BookOpen, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-cream-300 rounded-3xl max-w-lg w-full p-6 shadow-elevated relative max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-earth-500 hover:text-earth-800 p-1.5 rounded-lg hover:bg-cream-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-crimson-100 text-crimson-800 flex items-center justify-center border border-crimson-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-earth-950">Job Queue Transition Rules</h2>
            <p className="text-xs text-earth-600">Assignment Specification & Concurrency Invariants</p>
          </div>
        </div>

        {/* Diagram Box */}
        <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-earth-600">
            Allowed State Lifecycle
          </span>

          <div className="flex items-center justify-between gap-1 text-xs font-bold text-earth-900 py-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
              pending
            </span>
            <ArrowRight className="w-4 h-4 text-earth-400" />
            <span className="px-2.5 py-1 rounded-lg bg-crimson-100 text-crimson-800 border border-crimson-200">
              running
            </span>
            <ArrowRight className="w-4 h-4 text-earth-400" />
            <div className="flex flex-col gap-1.5">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                completed
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
                failed
              </span>
            </div>
          </div>

          <p className="text-[11px] text-earth-600 leading-relaxed border-t border-cream-200 pt-2">
            <strong>Rule 1:</strong> A job can only transition from <code className="text-amber-800">pending</code> to <code className="text-crimson-800">running</code>, and then to <code className="text-emerald-800">completed</code> or <code className="text-rose-800">failed</code>.
          </p>
          <p className="text-[11px] text-earth-600 leading-relaxed">
            <strong>Rule 2 (Terminal Immutability):</strong> A completed or failed job can <strong className="text-crimson-800">never</strong> become running again.
          </p>
        </div>

        {/* Real world concurrency problem explanation */}
        <div className="space-y-3 text-xs text-earth-700">
          <h4 className="font-bold text-earth-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-crimson-700" />
            <span>Handling the 2-Browser-Tabs Race Condition</span>
          </h4>
          <p className="leading-relaxed">
            When two tabs attempt to transition a <code className="text-amber-800">pending</code> job to <code className="text-crimson-800">running</code> at nearly the same instant:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-earth-600">
            <li>Rules are strictly enforced at the <strong>backend database layer</strong> via atomic SQL conditional updates: <code className="block mt-0.5 p-1 bg-cream-100 rounded text-[10px] text-earth-800">UPDATE jobs SET status = 'running' WHERE id = ? AND status = 'pending'</code></li>
            <li>Tab 1 touches 1 row and receives <strong className="text-emerald-700">HTTP 200 OK</strong>.</li>
            <li>Tab 2 matches 0 rows and is rejected with <strong className="text-crimson-800">HTTP 409 Conflict</strong>.</li>
            <li>No duplicate executions or inconsistent states can ever occur.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-cream-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-earth-800 hover:bg-earth-900 text-white text-xs font-bold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

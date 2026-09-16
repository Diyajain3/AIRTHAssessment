import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

const PRESET_TYPES = [
  'email',
  'report',
  'export',
  'import',
  'sync',
  'custom'
];

export function CreateJobModal({ isOpen, onClose, onCreateJob }) {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState('email');
  const [customType, setCustomType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalTitle = title.trim();
    const finalType = selectedType === 'custom' ? customType.trim().toLowerCase() : selectedType;

    if (!finalTitle) {
      setError('Please provide a job title.');
      return;
    }

    if (selectedType === 'custom' && !finalType) {
      setError('Please enter a custom type.');
      return;
    }

    setLoading(true);
    try {
      await onCreateJob({ title: finalTitle, type: finalType });
      setTitle('');
      setSelectedType('email');
      setCustomType('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-[#1e293b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#16a34a]/10 border border-[#16a34a]/30 flex items-center justify-center text-[#22c55e]">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Create New Job</h3>
            <p className="text-xs text-slate-400 font-mono">Status will be initialized to 'pending'</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              JOB TITLE
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly newsletter dispatch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0c121e] border border-[#1f293d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              JOB TYPE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono border text-center transition-all ${
                    selectedType === type
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                      : 'bg-[#0c121e] border-[#1f293d] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {selectedType === 'custom' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Enter custom type, e.g. transcode"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0c121e] border border-[#1f293d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f293d]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Queue Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, LayoutGrid, ArrowRight, Lock, Mail, User, Sparkles, LogOut } from 'lucide-react';

export function AuthModal({ isOpen, onClose, user, onLogin, onLogout }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const userData = {
      name: isSignUp ? name.trim() : (email.split('@')[0].toUpperCase()),
      email: email.trim().toLowerCase(),
      role: 'Staff Engineer'
    };

    localStorage.setItem('queuepilot_user', JSON.stringify(userData));
    onLogin(userData);
    onClose();
  };

  const handleDemoSignIn = () => {
    const demoUser = {
      name: 'Alex Mercer',
      email: 'alex.mercer@airth.dev',
      role: 'Queue Architect'
    };
    localStorage.setItem('queuepilot_user', JSON.stringify(demoUser));
    onLogin(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070c]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-[#1e293b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Stamp */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#1e293b] border border-[#334155] flex items-center justify-center text-blue-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">JobQueue Portal</h3>
            <p className="text-xs text-slate-400">Authentication & Session Management</p>
          </div>
        </div>

        {/* If user is already logged in, show user info and sign out button */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#162032] border border-[#1f293d] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f293d]">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex rounded-lg bg-[#0c121e] p-1 mb-5 border border-[#1f293d]">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  !isSignUp
                    ? 'bg-[#1e293b] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  isSignUp
                    ? 'bg-[#1e293b] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Maya Lin"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#0c121e] border border-[#1f293d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="engineer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#0c121e] border border-[#1f293d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#0c121e] border border-[#1f293d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1f293d]"></div>
              </div>
              <span className="relative px-2 bg-[#111827] text-[10px] font-mono text-slate-500 uppercase">
                or quick access
              </span>
            </div>

            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2 px-3 rounded-lg bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Demo Login (Alex Mercer)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

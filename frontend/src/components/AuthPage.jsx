import React, { useState } from 'react';
import { Layers, ArrowRight, Lock, Mail, User, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export function AuthPage({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
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
      name: isSignUp ? name.trim() : (email.split('@')[0].replace('.', ' ').toUpperCase()),
      email: email.trim().toLowerCase(),
      role: 'Staff Engineer',
      avatar: null,
      signedInAt: new Date().toISOString()
    };

    localStorage.setItem('queuepilot_user', JSON.stringify(userData));
    onLoginSuccess(userData);
  };

  const handleDemoSignIn = () => {
    const demoUser = {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@airth.dev',
      role: 'Staff Queue Architect',
      avatar: null,
      signedInAt: new Date().toISOString()
    };
    localStorage.setItem('queuepilot_user', JSON.stringify(demoUser));
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4 selection:bg-crimson-100 selection:text-crimson-900">
      <div className="max-w-md w-full">
        {/* Brand stamp */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-crimson-700 text-white shadow-lg shadow-crimson-700/20 mb-3">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-earth-950 tracking-tight">QueuePilot</h1>
          <p className="text-xs text-earth-600 mt-1 font-medium">
            Mini Job Queue & Concurrency Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-elevated relative overflow-hidden">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-crimson-700 via-crimson-600 to-amber-700"></div>

          {/* Toggle Tab */}
          <div className="flex rounded-xl bg-cream-200/80 p-1 mb-6 border border-cream-300">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-white text-earth-950 shadow-soft'
                  : 'text-earth-600 hover:text-earth-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-white text-earth-950 shadow-soft'
                  : 'text-earth-600 hover:text-earth-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-lg font-serif font-bold text-earth-950">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-earth-600 mt-0.5">
              {isSignUp
                ? 'Enter your details to access the queue dashboard'
                : 'Sign in to monitor and manage distributed job transitions'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-crimson-50 border border-crimson-200 text-xs text-crimson-800 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-earth-900 placeholder-earth-400 focus:outline-none focus:border-crimson-700 focus:ring-1 focus:ring-crimson-700 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-earth-800 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-earth-900 placeholder-earth-400 focus:outline-none focus:border-crimson-700 focus:ring-1 focus:ring-crimson-700 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-earth-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-earth-900 placeholder-earth-400 focus:outline-none focus:border-crimson-700 focus:ring-1 focus:ring-crimson-700 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-crimson-700 hover:bg-crimson-800 text-white text-xs font-bold shadow-md shadow-crimson-700/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{isSignUp ? 'Create Account' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream-300"></div>
            </div>
            <span className="relative px-3 bg-white text-[11px] font-bold uppercase tracking-wider text-earth-500">
              or instant access
            </span>
          </div>

          {/* 1-Click Demo Login */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-earth-800 text-xs font-bold transition-all hover:border-cream-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Continue as Sarah Jenkins (Lead Architect)</span>
          </button>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-earth-500 mt-6">
          Mini Job Queue Dashboard · React & Node/Express · SQLite OCC Engine
        </p>
      </div>
    </div>
  );
}

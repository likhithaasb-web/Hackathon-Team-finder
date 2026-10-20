import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, ArrowRight, Sparkles, Shield, User } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result?.success) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome back to HackMate
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            Enter your credentials to access your teams, matches, and chats.
          </p>
        </div>

        {/* Demo Accounts Quick-Fill bar */}
        <div className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/60 text-xs">
          <p className="font-semibold text-brand-800 dark:text-brand-300 mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>One-Click Demo Accounts (Password: Password@123)</span>
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@hackmate.dev')}
              className="p-1.5 rounded-lg bg-white dark:bg-dark-card border border-brand-200 dark:border-brand-800/80 text-left hover:border-brand-500 transition-colors flex items-center space-x-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="truncate font-medium">Admin (Alex Rivera)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sophia@hackmate.dev')}
              className="p-1.5 rounded-lg bg-white dark:bg-dark-card border border-brand-200 dark:border-brand-800/80 text-left hover:border-brand-500 transition-colors flex items-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span className="truncate font-medium">UI/UX (Sophia)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('marcus@hackmate.dev')}
              className="p-1.5 rounded-lg bg-white dark:bg-dark-card border border-brand-200 dark:border-brand-800/80 text-left hover:border-brand-500 transition-colors flex items-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate font-medium">Backend (Marcus)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('priya@hackmate.dev')}
              className="p-1.5 rounded-lg bg-white dark:bg-dark-card border border-brand-200 dark:border-brand-800/80 text-left hover:border-brand-500 transition-colors flex items-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate font-medium">AI/ML (Priya)</span>
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card shadow-xl border border-gray-200 dark:border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@stanford.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-glow transition-all"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Don’t have an account yet?{' '}
              <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

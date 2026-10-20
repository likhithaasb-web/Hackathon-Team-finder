import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoToken, setDemoToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      if (res.data?.success) {
        toast.success(res.data.message);
        if (res.data.demoResetToken) {
          setDemoToken(res.data.demoResetToken);
        }
      }
    } catch (err) {
      toast.error('Unable to send reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your email to receive password reset instructions.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl glass-card shadow-xl border border-gray-200 dark:border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@stanford.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-glow transition-all"
            >
              <span>{submitting ? 'Sending...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick link in development demo */}
          {demoToken && (
            <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-800 text-xs">
              <p className="font-semibold text-brand-800 dark:text-brand-300">
                Demo Reset Link Generated:
              </p>
              <Link
                to={`/reset-password/${demoToken}`}
                className="text-brand-600 dark:text-brand-400 hover:underline break-all mt-1 inline-block"
              >
                Click here to reset password directly →
              </Link>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-gray-500 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

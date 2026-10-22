import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Loader2,
  Users,
  Shield,
  User,
  Crown,
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onSuccess, redirectPath = '/discover' }) {
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider) => {
    setErrorMessage('');

    if (provider === 'google') {
      const googleClientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        '904718276042-c385ilns6gca737pr0u2f7o37m7a4sk7.apps.googleusercontent.com';

      if (window.google?.accounts?.oauth2 && googleClientId) {
        setSocialLoading('google');
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                setSocialLoading(null);
                const errDetail = tokenResponse.error_description || tokenResponse.error;
                if (String(errDetail).includes('access_denied') || String(errDetail).includes('restricted')) {
                  setErrorMessage(
                    'Google Sign-In Restricted: In Google Cloud Console, go to "OAuth consent screen" → "Test users" → add your Google email address.'
                  );
                } else if (String(errDetail).includes('popup_closed_by_user')) {
                  setErrorMessage('Google Sign-In popup was closed before completing login.');
                } else {
                  setErrorMessage(`Google Sign-In: ${errDetail}`);
                }
                return;
              }

              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleProfile = await userRes.json();

                const result = await socialLogin('google', {
                  email: googleProfile.email,
                  fullName: googleProfile.name,
                  avatarUrl: googleProfile.picture,
                });

                setSocialLoading(null);
                if (result?.success) {
                  onClose?.();
                  if (onSuccess) {
                    onSuccess(result.user);
                  } else {
                    navigate(redirectPath);
                  }
                } else {
                  setErrorMessage(result?.message || 'Failed to complete sign in.');
                }
              } catch (fetchErr) {
                setSocialLoading(null);
                setErrorMessage('Failed to retrieve user profile from Google. Please try again.');
              }
            },
          });
          client.requestAccessToken({ prompt: 'select_account' });
          return;
        } catch (err) {
          console.warn('GIS popup init failed, using fallback', err);
        }
      }
    }

    // Fallback / GitHub
    setSocialLoading(provider);
    const profileData = email.trim() ? { email: email.trim() } : {};
    const result = await socialLogin(provider, profileData);
    setSocialLoading(null);

    if (result?.success) {
      onClose?.();
      if (onSuccess) {
        onSuccess(result.user);
      } else {
        navigate(redirectPath);
      }
    } else {
      setErrorMessage(
        result?.message || `Failed to sign in with ${provider}. Please try again.`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (result?.success) {
      onClose?.();
      if (onSuccess) {
        onSuccess(result.user);
      } else {
        navigate(redirectPath);
      }
    } else {
      setErrorMessage(
        result?.message || 'Invalid email or password. Please verify your credentials and try again.'
      );
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setErrorMessage('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#0E1526]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-10 overflow-hidden my-6 p-6 sm:p-8 text-white"
        >
          {/* Subtle violet highlight */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1.5 mb-5">
            <div className="w-11 h-11 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-brand-600 flex items-center justify-center text-white shadow-glow-violet border border-white/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white pt-1">
              Sign in to Hack<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-brand-400">Mate</span>
            </h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Find your people. Build your team. Win your next hackathon.
            </p>
          </div>

          {/* Quick Demo Accounts */}
          <div className="mb-4 p-2.5 rounded-2xl bg-navy-900/80 border border-violet-500/20 text-xs shadow-inner space-y-1.5">
            <span className="font-bold text-violet-300 flex items-center space-x-1.5 text-[11px]">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>One-Click Demo Accounts</span>
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('likhitha.asb@gmail.com')}
                className="px-1.5 py-1 rounded-lg bg-violet-600/25 hover:bg-violet-600/40 border border-violet-500/30 text-left transition-all flex items-center space-x-1 group"
              >
                <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate font-bold text-white text-[10px]">Likhitha</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hackmate.dev')}
                className="px-1.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all flex items-center space-x-1 group"
              >
                <Shield className="w-3 h-3 text-violet-400 shrink-0" />
                <span className="truncate font-semibold text-gray-200 text-[10px]">Alex</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sophia@hackmate.dev')}
                className="px-1.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all flex items-center space-x-1 group"
              >
                <User className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate font-semibold text-gray-200 text-[10px]">Sophia</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-200">Unable to sign in</p>
                <p className="mt-0.5 text-red-300/90 leading-relaxed text-[11px]">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-red-400 hover:text-red-200 p-0.5 rounded transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="modal-email"
                className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="modal-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-900/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="modal-password"
                  className="block text-[10px] font-bold uppercase tracking-wider text-gray-400"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  className="text-[11px] text-violet-400 hover:text-violet-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="modal-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-navy-900/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-violet-600 focus:ring-violet-500 border-white/20 bg-navy-900/60 cursor-pointer"
                />
                <span className="text-[11px] text-gray-400 hover:text-gray-300">
                  Remember this device
                </span>
              </label>
              <span className="text-[10px] text-gray-500">256-bit encrypted</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-brand-600 hover:from-violet-500 hover:via-indigo-500 hover:to-brand-500 active:scale-[0.99] disabled:opacity-60 shadow-glow-violet transition-all group"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to HackMate</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0E1526] px-3 text-[10px] font-semibold tracking-wider text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Logins: Displayed ON THE DOWN OF THE PASSWORD */}
          <div className="space-y-2">
            {/* Continue with Google */}
            <button
              type="button"
              disabled={socialLoading !== null || submitting}
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center space-x-2.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all shadow-sm group disabled:opacity-50"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{socialLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Continue with GitHub */}
            <button
              type="button"
              disabled={socialLoading !== null || submitting}
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center space-x-2.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all shadow-sm group disabled:opacity-50"
            >
              {socialLoading === 'github' ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              )}
              <span>{socialLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}</span>
            </button>
          </div>

          {/* Footer Signup Link */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400">
              Don’t have an account yet?{' '}
              <Link
                to="/register"
                onClick={onClose}
                className="font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors"
              >
                Create one now →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

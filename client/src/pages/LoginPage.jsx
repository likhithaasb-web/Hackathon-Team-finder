import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Loader2,
  Users,
  Check,
  Database,
  RefreshCw,
  ExternalLink,
  Crown,
} from 'lucide-react';

export default function LoginPage() {
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');

  const handleSocialLogin = async (provider) => {
    setErrorMessage('');
    setErrorCode('');

    if (provider === 'google') {
      const googleClientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        '904718276042-c385ilns6gca737pr0u2f7o37m7a4sk7.apps.googleusercontent.com';

      // If GIS library is loaded and client ID exists, trigger Google OAuth Popup
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
                // Fetch verified profile from Google userinfo
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
                  navigate(from, { replace: true });
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
          console.warn('GIS popup init failed, using direct sign-in fallback', err);
        }
      }
    }

    // Default flow / fallback / GitHub
    setSocialLoading(provider);
    const profileData = email.trim() ? { email: email.trim() } : {};
    const result = await socialLogin(provider, profileData);
    setSocialLoading(null);

    if (result?.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(
        result?.message || `Failed to sign in with ${provider}. Please try again.`
      );
      if (result?.code) {
        setErrorCode(result.code);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorCode('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (result?.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(
        result?.message || 'Invalid email or password. Please verify your credentials and try again.'
      );
      if (result?.code) {
        setErrorCode(result.code);
      }
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await apiClient.post('/system/seed');
      if (res.data?.success) {
        toast.success('Database initialized with 16 users, 10 hackathons, and 16 demo teams!');
        setErrorMessage('');
        setErrorCode('');
      } else {
        toast.error(res.data?.message || 'Failed to initialize database.');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Database is unreachable. Please verify MONGODB_URI in Render.'
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setErrorMessage('');
    setErrorCode('');
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#080D1A] text-white selection:bg-violet-600 selection:text-white">
      {/* 1. Subtle Ambient Background Lighting & Radial Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-violet-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-24 left-1/4 w-[450px] h-[300px] bg-brand-600/10 blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 -right-24 w-[380px] h-[300px] bg-violet-800/10 blur-3xl pointer-events-none -z-0" />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 -z-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        {/* 2. Header Branding & Typography */}
        <div className="text-center space-y-2">
          {/* HackMate Logo */}
          <Link
            to="/"
            className="inline-flex items-center space-x-2.5 group transition-transform hover:scale-[1.02]"
            aria-label="HackMate Home"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-brand-600 flex items-center justify-center text-white shadow-glow-violet border border-white/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Hack<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-brand-400">Mate</span>
            </span>
          </Link>

          {/* Headline & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-2">
            Build something amazing
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            Find your people. Build your team. Win your next hackathon.
          </p>
        </div>

        {/* 3. Demo Quick-Login Bar for Easy Testing */}
        <div className="p-3.5 rounded-2xl bg-navy-900/70 border border-violet-500/20 backdrop-blur-md text-xs shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-violet-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>One-Click Demo Accounts</span>
            </span>
            <button
              type="button"
              disabled={seeding}
              onClick={handleSeedDatabase}
              title="Populate or reset demo users, hackathons & projects in the database"
              className="text-[10px] text-violet-300 hover:text-white flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-violet-600/30 border border-white/10 transition-colors"
            >
              {seeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              <span>{seeding ? 'Seeding...' : 'Seed Data'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('likhitha.asb@gmail.com')}
              className="px-2 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/30 text-left transition-all flex items-center space-x-1.5 group"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate font-bold text-white text-[11px]">Likhitha (Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@hackmate.dev')}
              className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-left transition-all flex items-center space-x-1.5 group"
            >
              <Shield className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate font-semibold text-gray-200 group-hover:text-white text-[11px]">Alex (Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sophia@hackmate.dev')}
              className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-left transition-all flex items-center space-x-1.5 group"
            >
              <User className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate font-semibold text-gray-200 group-hover:text-white text-[11px]">Sophia (UI/UX)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('marcus@hackmate.dev')}
              className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-left transition-all flex items-center space-x-1.5 group"
            >
              <User className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate font-semibold text-gray-200 group-hover:text-white text-[11px]">Marcus (Cloud)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('priya@hackmate.dev')}
              className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-left transition-all flex items-center space-x-1.5 group"
            >
              <User className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate font-semibold text-gray-200 group-hover:text-white text-[11px]">Priya (AI/ML)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('liam@hackmate.dev')}
              className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-left transition-all flex items-center space-x-1.5 group"
            >
              <User className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate font-semibold text-gray-200 group-hover:text-white text-[11px]">Liam (Web3)</span>
            </button>
          </div>
        </div>

        {/* 4. Main Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1526]/85 backdrop-blur-xl border border-white/10 shadow-2xl shadow-navy-950/80 relative">
          {/* Subtle top violet highlight */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

          {/* Diagnostic Card for Database Offline */}
          {(errorCode === 'DATABASE_DISCONNECTED' || errorMessage.toLowerCase().includes('buffer') || errorMessage.toLowerCase().includes('database')) ? (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 text-amber-300 font-bold">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>MongoDB Atlas Connection Required</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setErrorCode('');
                  }}
                  className="text-amber-400 hover:text-amber-200 p-0.5 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-gray-300 text-[11px] leading-relaxed">
                The backend on Render cannot reach MongoDB. Please complete these 2 quick steps:
              </p>

              <div className="space-y-1.5 text-[11px] bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-gray-300">
                <p>
                  <strong className="text-amber-300">1. Atlas Network Access:</strong> In{' '}
                  <span className="text-white">cloud.mongodb.com</span> → Security → Network Access, add IP{' '}
                  <span className="text-emerald-400 font-bold bg-white/10 px-1 py-0.5 rounded">0.0.0.0/0</span> (Allow access from anywhere).
                </p>
                <p>
                  <strong className="text-amber-300">2. Render Environment:</strong> In{' '}
                  <span className="text-white">dashboard.render.com</span> → Web Service → Environment, set{' '}
                  <span className="text-violet-300 font-bold bg-white/10 px-1 py-0.5 rounded">MONGODB_URI</span> to your Atlas connection string.
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  disabled={seeding}
                  onClick={handleSeedDatabase}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-all disabled:opacity-50"
                >
                  {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>{seeding ? 'Testing & Seeding...' : 'Test Connection & Seed Data'}</span>
                </button>
                <a
                  href="https://cloud.mongodb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline inline-flex items-center space-x-1"
                >
                  <span>MongoDB Atlas</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : errorMessage ? (
            /* Standard Error Banner */
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-200">Unable to sign in</p>
                <p className="mt-0.5 text-red-300/90 leading-relaxed">{errorMessage}</p>
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
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-3 bg-navy-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-400"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-violet-400 hover:text-violet-300 hover:underline font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-navy-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-white/20 bg-navy-900/60 cursor-pointer"
                />
                <span className="text-xs text-gray-400 hover:text-gray-300">
                  Remember this device
                </span>
              </label>
              <span className="text-[11px] text-gray-500">256-bit encrypted</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 inline-flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-brand-600 hover:from-violet-500 hover:via-indigo-500 hover:to-brand-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-violet transition-all duration-200 group"
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
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0E1526] px-3 text-[11px] font-semibold tracking-wider text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Continue with Google & GitHub Social Buttons (Displayed on the down of the password) */}
          <div className="space-y-2.5">
            {/* Continue with Google */}
            <button
              type="button"
              disabled={socialLoading !== null || submitting}
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all shadow-sm group disabled:opacity-50"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>
                {socialLoading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
              </span>
            </button>

            {/* Continue with GitHub */}
            <button
              type="button"
              disabled={socialLoading !== null || submitting}
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all shadow-sm group disabled:opacity-50"
            >
              {socialLoading === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <svg
                  className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-105 transition-transform"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              )}
              <span>
                {socialLoading === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}
              </span>
            </button>
          </div>

          {/* Signup Link */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400">
              Don’t have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors"
              >
                Create one now →
              </Link>
            </p>
          </div>
        </div>

        {/* 5. Terms of Service & Privacy Policy Links */}
        <div className="text-center text-[11px] text-gray-500 space-y-1">
          <p>
            By signing in, you agree to HackMate's{' '}
            <Link
              to="/help"
              className="text-gray-400 hover:text-violet-300 underline decoration-white/20 underline-offset-4 transition-colors"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/help"
              className="text-gray-400 hover:text-violet-300 underline decoration-white/20 underline-offset-4 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-[10px] text-gray-600">
            Protected by enterprise rate limiting and session encryption.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

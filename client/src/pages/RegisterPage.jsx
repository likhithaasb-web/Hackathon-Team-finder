import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Code2,
  Globe,
  Briefcase,
  Github,
  Linkedin,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'Tailwind CSS', 'Figma',
  'PyTorch', 'FastAPI', 'Next.js', 'Go', 'Docker', 'PostgreSQL',
  'MongoDB', 'Solidity', 'AWS', 'Flutter', 'UI/UX Design', 'C++',
];

const PREFERRED_ROLES = [
  'Frontend', 'Backend', 'Full-Stack', 'AI/ML Engineer',
  'UI/UX Designer', 'Cloud / DevOps', 'Blockchain', 'Cybersecurity',
  'Mobile Developer', 'Data Science', 'Business & Pitch',
];

export default function RegisterPage() {
  const { register, socialLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSocialRegister = async (provider) => {
    setErrorMessage('');
    if (provider === 'google') {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
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
                  setErrorMessage('Google Sign-In popup was closed before completing registration.');
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
                  navigate('/dashboard');
                } else {
                  setErrorMessage(result?.message || 'Failed to complete registration with Google.');
                }
              } catch (err) {
                setSocialLoading(null);
                setErrorMessage('Failed to retrieve user profile from Google. Please try again.');
              }
            },
          });
          client.requestAccessToken({ prompt: 'select_account' });
          return;
        } catch (err) {
          console.warn('GIS error in register', err);
        }
      }
    }

    setSocialLoading(provider);
    const result = await socialLogin(provider);
    setSocialLoading(null);
    if (result?.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result?.message || `Failed to sign up with ${provider}.`);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    roleTitle: 'Full-Stack Developer',
    college: '',
    department: 'Computer Science',
    degree: 'B.S.',
    yearOfStudy: 'Junior',
    location: '',
    experienceLevel: 'Intermediate',
    preferredRoles: ['Full-Stack'],
    skills: ['React', 'Node.js'],
    interests: ['AI & Machine Learning'],
    preferredHackathonCategories: ['AI & Machine Learning', 'Open Innovation'],
    availability: 'Flexible',
    collaborationMode: 'Remote',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const list = prev[field] || [];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter(x => x !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.fullName || !formData.username || !formData.email || !formData.password) {
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    const res = await register(formData);
    setSubmitting(false);

    if (res?.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(res?.message || 'Failed to complete registration.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-800 to-brand-600 flex items-center justify-center text-white shadow-royal mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Join the HackMate Community
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Build your profile to unlock smart teammate compatibility matching.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-brand-700 text-white shadow-royal'
                      : step > s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 dark:bg-dark-card text-gray-500'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-1.5 rounded-full transition-colors ${
                      step > s ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-dark-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mt-2">
            {step === 1 && 'Step 1: Account Credentials'}
            {step === 2 && 'Step 2: Role & Academic Background'}
            {step === 3 && 'Step 3: Skills, Roles & Synergy Setup'}
          </p>
        </div>

        {/* Wizard Card */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card shadow-xl border border-gray-200 dark:border-dark-border">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed font-medium">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="hover:opacity-75 transition-opacity p-0.5"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              {/* Social Login Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={socialLoading !== null}
                  onClick={() => handleSocialRegister('google')}
                  className="w-full flex items-center justify-center space-x-2.5 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-border/50 border border-gray-300 dark:border-dark-border text-gray-800 dark:text-white text-xs font-semibold transition-all shadow-sm"
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
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
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  disabled={socialLoading !== null}
                  onClick={() => handleSocialRegister('github')}
                  className="w-full flex items-center justify-center space-x-2.5 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-border/50 border border-gray-300 dark:border-dark-border text-gray-800 dark:text-white text-xs font-semibold transition-all shadow-sm"
                >
                  {socialLoading === 'github' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  ) : (
                    <svg className="w-4 h-4 fill-current text-gray-900 dark:text-white shrink-0" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                  )}
                  <span>Continue with GitHub</span>
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-dark-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-dark-card px-3 text-[10px] font-semibold tracking-wider text-gray-400">
                    Or register with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleNext} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Username *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="alexrivera"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="alex@stanford.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Password (min 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 inline-flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm text-white bg-brand-700 hover:bg-brand-800 shadow-royal transition-all"
              >
                <span>Continue to Profile Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Primary Role / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roleTitle}
                  onChange={(e) => updateField('roleTitle', e.target.value)}
                  placeholder="e.g. AI Researcher & Backend Engineer"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    College / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => updateField('college', e.target.value)}
                    placeholder="Stanford University"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Year of Study
                  </label>
                  <select
                    value={formData.yearOfStudy}
                    onChange={(e) => updateField('yearOfStudy', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Alumni / Professional">Alumni / Professional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => updateField('experienceLevel', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Beginner">Beginner (1st or 2nd hackathon)</option>
                    <option value="Intermediate">Intermediate (3-5 hackathons)</option>
                    <option value="Advanced">Advanced (Prior track winner)</option>
                    <option value="Expert">Expert (Grand prize champion)</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 inline-flex items-center justify-center space-x-1.5 py-3 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-card hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm text-white bg-brand-700 hover:bg-brand-800 shadow-royal transition-all"
                >
                  <span>Next: Skills & Preferences</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Select Technical Skills & Tools (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                  {COMMON_SKILLS.map((sk) => {
                    const isSelected = formData.skills.includes(sk);
                    return (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => toggleArrayItem('skills', sk)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border hover:border-brand-500'
                        }`}
                      >
                        {sk} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Preferred Team Roles
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PREFERRED_ROLES.map((role) => {
                    const isSelected = formData.preferredRoles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleArrayItem('preferredRoles', role)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-brand-700 text-white shadow-royal'
                            : 'bg-beige-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-beige-200 dark:border-dark-border'
                        }`}
                      >
                        {role} {isSelected ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Collaboration Mode
                  </label>
                  <select
                    value={formData.collaborationMode}
                    onChange={(e) => updateField('collaborationMode', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="In-person">In-person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Sprint Availability
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => updateField('availability', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Full-time">Full-time sprint commitment</option>
                    <option value="Part-time">Part-time (10-15 hrs/week)</option>
                    <option value="Weekends only">Weekends only</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Bio / Introduction
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Share your strengths, past hackathons, or what you want to build..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => updateField('githubUrl', e.target.value)}
                    placeholder="GitHub URL"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-xs text-gray-900 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => updateField('linkedinUrl', e.target.value)}
                    placeholder="LinkedIn URL"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 inline-flex items-center justify-center space-x-1.5 py-3 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-card hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-50 shadow-royal transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Creating Profile...' : 'Complete & Launch HackMate'}</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-brand-700 dark:text-brand-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

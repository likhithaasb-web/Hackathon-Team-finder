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
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    const res = await register(formData);
    setSubmitting(false);

    if (res?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow mb-3">
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
                      ? 'bg-brand-600 text-white shadow-glow'
                      : step > s
                      ? 'bg-emerald-500 text-white'
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
          {step === 1 && (
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
                className="w-full mt-4 inline-flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-glow transition-all"
              >
                <span>Continue to Profile Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
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
                  className="flex-1 inline-flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-glow transition-all"
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
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                  className="flex-1 inline-flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-glow transition-all"
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
              <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

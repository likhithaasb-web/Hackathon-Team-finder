import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  User,
  GraduationCap,
  MapPin,
  Clock,
  Sparkles,
  Save,
  Plus,
  X,
  Github,
  Linkedin,
  Globe,
} from 'lucide-react';

const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'Tailwind CSS', 'Figma',
  'PyTorch', 'FastAPI', 'Next.js', 'Go', 'Docker', 'PostgreSQL',
  'MongoDB', 'Solidity', 'AWS', 'Flutter', 'UI/UX Design', 'C++',
  'Rust', 'GraphQL', 'Kubernetes', 'Pandas', 'TensorFlow', 'Three.js',
];

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    roleTitle: user?.roleTitle || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    college: user?.college || '',
    department: user?.department || '',
    degree: user?.degree || '',
    yearOfStudy: user?.yearOfStudy || 'Junior',
    location: user?.location || '',
    timeZone: user?.timeZone || 'America/Los_Angeles',
    skills: user?.skills || [],
    preferredRoles: user?.preferredRoles || [],
    preferredHackathonCategories: user?.preferredHackathonCategories || [],
    experienceLevel: user?.experienceLevel || 'Intermediate',
    availability: user?.availability || 'Flexible',
    collaborationMode: user?.collaborationMode || 'Remote',
    lookingForTeam: user?.lookingForTeam !== undefined ? user.lookingForTeam : true,
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
  });

  const [customSkillInput, setCustomSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter(s => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  const addCustomSkill = (e) => {
    e.preventDefault();
    if (customSkillInput.trim() && !formData.skills.includes(customSkillInput.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, customSkillInput.trim()] }));
      setCustomSkillInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await updateProfile(formData);
    setSubmitting(false);
    if (res?.success) {
      navigate('/profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Keep your skills and availability updated to receive accurate recommendations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Role Title (Headline) *
              </label>
              <input
                type="text"
                required
                value={formData.roleTitle}
                onChange={(e) => updateField('roleTitle', e.target.value)}
                placeholder="e.g. AI Researcher & Full-Stack"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => updateField('avatarUrl', e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Bio / Philosophy
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Tell other builders about your background, favorite tech, or what you want to build..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm resize-none"
            />
          </div>

          {/* Looking for team toggle */}
          <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Looking for a Hackathon Team
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Display badge and feature your card in teammate discovery.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.lookingForTeam}
              onChange={(e) => updateField('lookingForTeam', e.target.checked)}
              className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Academic & Experience */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
            Academic Background & Availability
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                College / Institution
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => updateField('college', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Year of Study
              </label>
              <select
                value={formData.yearOfStudy}
                onChange={(e) => updateField('yearOfStudy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              >
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
                <option value="Alumni / Professional">Alumni / Professional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => updateField('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Sprint Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) => updateField('availability', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              >
                <option value="Full-time">Full-time sprint commitment</option>
                <option value="Part-time">Part-time (10-15 hrs/week)</option>
                <option value="Weekends only">Weekends only</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Collaboration Mode
              </label>
              <select
                value={formData.collaborationMode}
                onChange={(e) => updateField('collaborationMode', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              >
                <option value="Remote">Remote</option>
                <option value="In-person">In-person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills Selection */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
            Technical Stack & Skills
          </h3>

          <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
            {COMMON_SKILLS.map((sk) => {
              const active = formData.skills.includes(sk);
              return (
                <button
                  type="button"
                  key={sk}
                  onClick={() => toggleSkill(sk)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border'
                  }`}
                >
                  {sk} {active ? '✓' : '+'}
                </button>
              );
            })}
          </div>

          {/* Add custom skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              placeholder="Add other skill (e.g., Supabase, WebGL)..."
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs"
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="px-4 py-2 bg-gray-200 dark:bg-dark-border hover:bg-gray-300 rounded-xl text-xs font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        {/* Online Links */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
            Social & Portfolio Links
          </h3>

          <div className="space-y-3">
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => updateField('githubUrl', e.target.value)}
                placeholder="https://github.com/your-username"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs"
              />
            </div>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => updateField('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs"
              />
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => updateField('portfolioUrl', e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-glow"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

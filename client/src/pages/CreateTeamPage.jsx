import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  FolderGit2,
  Users,
  Trophy,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Code2,
} from 'lucide-react';

const COMMON_SKILLS = [
  'Java', 'Python', 'C', 'C++', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Next.js', 'Express', 'Tailwind CSS', 'HTML/CSS', 'FastAPI', 'Django',
  'PyTorch', 'TensorFlow', 'Machine Learning', 'Figma', 'UI/UX Design',
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'PostgreSQL', 'MongoDB',
  'MySQL', 'Redis', 'SQL', 'Go', 'Rust', 'Flutter', 'React Native',
  'Kotlin', 'Swift', 'Solidity', 'Web3', 'Git',
];

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedHackathon = searchParams.get('hackathonId') || '';

  const [hackathons, setHackathons] = useState([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hackathonId, setHackathonId] = useState(preselectedHackathon);
  const [problemStatement, setProblemStatement] = useState('');
  const [desiredSize, setDesiredSize] = useState(4);
  const [collaborationMode, setCollaborationMode] = useState('Remote');
  const [availabilityRequirements, setAvailabilityRequirements] = useState('10-15 hrs/week during hackathon');
  const [rules, setRules] = useState('Commit daily, join standup meetings, communicate respectfully.');
  const [repoUrl, setRepoUrl] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  // Required skills selection
  const [selectedSkills, setSelectedSkills] = useState(['React', 'Node.js']);

  // Open positions array
  const [openPositions, setOpenPositions] = useState([
    { role: 'UI/UX Designer', requiredSkills: ['Figma'], description: 'Design clean user flows and pitch assets' },
    { role: 'AI / Backend Engineer', requiredSkills: ['Python', 'FastAPI'], description: 'Build API and LLM inference pipeline' },
  ]);

  useEffect(() => {
    const loadHackathons = async () => {
      try {
        const res = await apiClient.get('/hackathons');
        if (res.data?.success) {
          setHackathons(res.data.hackathons || []);
          if (!hackathonId && res.data.hackathons.length > 0) {
            setHackathonId(res.data.hackathons[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHackathons(false);
      }
    };

    loadHackathons();
  }, []);

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addPosition = () => {
    setOpenPositions([
      ...openPositions,
      { role: 'Frontend Engineer', requiredSkills: ['React'], description: '' },
    ]);
  };

  const removePosition = (index) => {
    setOpenPositions(openPositions.filter((_, i) => i !== index));
  };

  const updatePosition = (index, field, value) => {
    const updated = [...openPositions];
    updated[index][field] = value;
    setOpenPositions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !hackathonId) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/teams', {
        name,
        description,
        hackathon: hackathonId,
        problemStatement,
        desiredSize,
        collaborationMode,
        availabilityRequirements,
        rules,
        repoUrl,
        meetingLink,
        requiredSkills: selectedSkills,
        openPositions,
      });

      if (res.data?.success) {
        toast.success('Team created successfully! 🎉');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        navigate(`/teams/${res.data.team._id}/workspace`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedHackathon = hackathons.find((h) => h._id === hackathonId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
          <span>Create a Hackathon Team</span>
          <Sparkles className="w-6 h-6 text-brand-600 dark:text-brand-400" />
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set up your team workspace, define open roles, and let our smart matching algorithm recruit talent for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column (2 Cols) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Team & Hackathon Association */}
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
                General Team Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. AgenticLabs, EcoGrid Dynamics"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Associated Hackathon *
                  </label>
                  <select
                    required
                    value={hackathonId}
                    onChange={(e) => setHackathonId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600"
                  >
                    {hackathons.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.title} ({h.format})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Short Description & Vision *
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you building and why is your team exciting to join?"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Problem Statement / Project Concept
                </label>
                <textarea
                  rows={3}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Explain the specific problem your team aims to solve during the hackathon..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
            </div>

            {/* Step 2: Team Capacity & Rules */}
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
                Capacity, Logistics & Expectations
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Desired Team Size (2-10)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={desiredSize}
                    onChange={(e) => setDesiredSize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Collaboration Mode
                  </label>
                  <select
                    value={collaborationMode}
                    onChange={(e) => setCollaborationMode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="In-person">In-person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Weekly Time Commitment
                  </label>
                  <input
                    type="text"
                    value={availabilityRequirements}
                    onChange={(e) => setAvailabilityRequirements(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    GitHub Repository URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/my-org/my-project"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Meeting Link (Zoom / Google Meet)
                  </label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Required Skills */}
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
                Required Technical Stack
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Candidates matching these skills will be prioritized in your recruitment suggestions.
              </p>

              <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                {COMMON_SKILLS.map((sk) => {
                  const active = selectedSkills.includes(sk);
                  return (
                    <button
                      type="button"
                      key={sk}
                      onClick={() => toggleSkill(sk)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-brand-700 text-white shadow-royal'
                          : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border hover:border-brand-500/50'
                      }`}
                    >
                      {sk} {active ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Open Positions Builder */}
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Open Positions for Recruitment
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Specify roles candidates can directly apply for.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPosition}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 hover:bg-brand-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-3">
                {openPositions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        type="text"
                        value={pos.role}
                        onChange={(e) => updatePosition(idx, 'role', e.target.value)}
                        placeholder="Role title (e.g., UI/UX Designer, AI Engineer)"
                        className="w-full px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-xs font-semibold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        type="text"
                        value={pos.description}
                        onChange={(e) => updatePosition(idx, 'description', e.target.value)}
                        placeholder="Short description of responsibility"
                        className="w-full px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePosition(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/teams')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-50 shadow-royal transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submitting ? 'Creating Team...' : 'Create Team & Launch Workspace'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card Column (1 Col, Sticky) */}
        <div className="lg:col-span-1 sticky top-20 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold tracking-wider uppercase text-brand-700 dark:text-brand-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Card Preview</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Auto-updating
            </span>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-brand-500/30 shadow-royal space-y-4 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {collaborationMode}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  1/{desiredSize || 4} Members
                </span>
              </div>

              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {name.trim() || 'Your Team Name'}
              </h4>
              <p className="text-xs text-brand-700 dark:text-brand-400 font-semibold mt-0.5">
                {selectedHackathon?.title || 'Selected Hackathon'}
              </p>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
              {description.trim() || 'Your team vision and description will appear here as you type...'}
            </p>

            {problemStatement.trim() && (
              <div className="p-2.5 rounded-xl bg-beige-50/70 dark:bg-dark-surface/70 border border-beige-300 dark:border-dark-border text-[11px]">
                <span className="font-bold text-brand-900 dark:text-brand-300 block mb-0.5">
                  Concept:
                </span>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                  {problemStatement}
                </p>
              </div>
            )}

            {/* Target Skills */}
            {selectedSkills.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1.5">
                  Tech Stack:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedSkills.slice(0, 6).map((sk) => (
                    <span key={sk} className="badge-skill text-[10px]">
                      {sk}
                    </span>
                  ))}
                  {selectedSkills.length > 6 && (
                    <span className="text-[10px] text-gray-400 px-1 py-0.5">
                      +{selectedSkills.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Open Roles Preview */}
            {openPositions.length > 0 && (
              <div className="pt-3 border-t border-gray-100 dark:border-dark-border">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1.5">
                  Recruiting Positions ({openPositions.length}):
                </span>
                <div className="space-y-1.5">
                  {openPositions.map((pos, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border"
                    >
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {pos.role || `Role #${i + 1}`}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Open
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-dark-border text-[11px] text-gray-400 flex items-center justify-between">
              <span>⚡ {availabilityRequirements || '10-15 hrs/week'}</span>
              <span className="font-semibold text-brand-600">Join Team →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

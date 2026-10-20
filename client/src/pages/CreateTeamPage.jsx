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
  'React', 'Node.js', 'Python', 'TypeScript', 'Tailwind CSS', 'Figma',
  'PyTorch', 'FastAPI', 'Next.js', 'Go', 'Docker', 'PostgreSQL',
  'MongoDB', 'Solidity', 'AWS', 'Flutter', 'UI/UX Design', 'C++',
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
          <span>Create a Hackathon Team</span>
          <Sparkles className="w-6 h-6 text-brand-500" />
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set up your team workspace, define open roles, and let our smart matching algorithm recruit talent for you.
        </p>
      </div>

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
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
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
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
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
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm resize-none"
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
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm resize-none"
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
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Collaboration Mode
              </label>
              <select
                value={collaborationMode}
                onChange={(e) => setCollaborationMode(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
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
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
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
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
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
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Required Skills */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
            Required Technical Stack
          </h3>
          <p className="text-xs text-gray-500">
            Candidates matching these skills will be highlighted in your recruitment suggestions.
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
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border'
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
              <p className="text-xs text-gray-500">
                Specify roles candidates can directly apply for.
              </p>
            </div>
            <button
              type="button"
              onClick={addPosition}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 hover:bg-brand-100 transition-colors"
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
                    className="w-full px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-xs font-semibold"
                  />
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    value={pos.description}
                    onChange={(e) => updatePosition(idx, 'description', e.target.value)}
                    placeholder="Short description of responsibility"
                    className="w-full px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-xs"
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
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Creating Team...' : 'Create Team & Launch Workspace'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

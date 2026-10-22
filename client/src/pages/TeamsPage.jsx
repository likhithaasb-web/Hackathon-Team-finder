import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import {
  FolderGit2,
  Users,
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';

const THEMES = [
  'All Themes',
  'AI & Machine Learning',
  'Web3',
  'FinTech',
  'HealthTech',
  'Sustainability',
  'Cybersecurity',
  'Cloud',
  'EdTech',
  'IoT & Hardware',
  'Open Innovation',
];

const ROLES = [
  'All Roles',
  'Frontend',
  'Backend',
  'Full-Stack',
  'AI/ML',
  'UI/UX Designer',
  'Cloud',
  'Blockchain',
  'Cybersecurity',
  'Data Science',
  'Mobile Developer',
  'Business & Pitch',
];

export default function TeamsPage() {
  const location = useLocation();
  const isMyTeamsInitial = location.pathname.includes('/my-teams');
  const [activeTab, setActiveTab] = useState(isMyTeamsInitial ? 'my' : 'all');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recruitmentStatus, setRecruitmentStatus] = useState('open');
  const [collaborationMode, setCollaborationMode] = useState('all');
  const [theme, setTheme] = useState('All Themes');
  const [role, setRole] = useState('All Roles');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    if (location.pathname.includes('/my-teams')) {
      setActiveTab('my');
    }
  }, [location.pathname]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my') {
        const res = await apiClient.get('/teams/my-teams');
        if (res.data?.success) {
          setTeams(res.data.teams || []);
          setPagination({ page: 1, pages: 1, total: res.data.teams?.length || 0 });
        }
      } else {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (recruitmentStatus !== 'all') params.append('recruitmentStatus', recruitmentStatus);
        if (collaborationMode !== 'all') params.append('collaborationMode', collaborationMode);
        if (theme && theme !== 'All Themes') params.append('theme', theme);
        if (role && role !== 'All Roles') params.append('role', role);
        params.append('page', pagination.page);

        const res = await apiClient.get(`/teams?${params.toString()}`);
        if (res.data?.success) {
          setTeams(res.data.teams || []);
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [activeTab, recruitmentStatus, collaborationMode, theme, role, pagination.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeams();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Explore Hackathon Teams</span>
            <FolderGit2 className="w-5 h-5 text-brand-500" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Join visionary teams recruiting developers, designers, and domain experts.
          </p>
        </div>

        <Link
          to="/teams/create"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-royal self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Team</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-dark-border pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-beige-100 text-brand-900 dark:bg-brand-950/70 dark:text-brand-300 border border-beige-300 dark:border-brand-800/60 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Explore All Teams
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
            activeTab === 'my'
              ? 'bg-beige-100 text-brand-900 dark:bg-brand-950/70 dark:text-brand-300 border border-beige-300 dark:border-brand-800/60 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>My Teams & Projects</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name, problem statement, or required technologies..."
            className="w-full pl-10 pr-24 py-2.5 bg-beige-50/70 dark:bg-dark-surface border border-beige-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-600"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 shadow-royal transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Recruitment Status
            </label>
            <select
              value={recruitmentStatus}
              onChange={(e) => setRecruitmentStatus(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              <option value="open">Actively Recruiting</option>
              <option value="closed">Recruitment Closed</option>
              <option value="all">All Teams</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Collaboration Mode
            </label>
            <select
              value={collaborationMode}
              onChange={(e) => setCollaborationMode(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              <option value="all">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="In-person">In-person</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Domain / Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Role Needed
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {(theme !== 'All Themes' || role !== 'All Roles' || recruitmentStatus !== 'open' || collaborationMode !== 'all' || search) && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setTheme('All Themes');
                  setRole('All Roles');
                  setRecruitmentStatus('all');
                  setCollaborationMode('all');
                  setSearch('');
                }}
                className="px-3 py-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-gray-200 dark:bg-dark-card animate-pulse" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No teams found"
          description="Be the first innovator to create a team for an upcoming hackathon!"
          actionText="Create Team"
          onAction={() => window.location.href = '/teams/create'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t) => {
            const unfilledPositions = (t.openPositions || []).filter(p => !p.filled);

            return (
              <div
                key={t._id}
                className="p-5 rounded-2xl glass-card flex flex-col justify-between group hover:border-brand-500/50 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        t.recruitmentStatus === 'open'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-gray-400'
                      }`}
                    >
                      {t.recruitmentStatus === 'open' ? 'Recruiting' : 'Closed'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {t.members?.length || 1}/{t.desiredSize} Devs
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 mb-0.5">
                    {t.name}
                  </h3>
                  <p className="text-xs text-brand-700 dark:text-brand-400 font-semibold truncate mb-2">
                    {t.hackathon?.title || 'Open Hackathon'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                    {t.description}
                  </p>

                  {/* Open positions highlight */}
                  {unfilledPositions.length > 0 && (
                    <div className="mb-3 p-2.5 rounded-xl bg-beige-100/70 dark:bg-brand-950/40 border border-beige-300/80 dark:border-brand-900/40 text-[11px]">
                      <span className="font-bold text-brand-900 dark:text-brand-300 block mb-1">
                        Looking for:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {unfilledPositions.slice(0, 2).map((p, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-dark-surface text-brand-800 dark:text-brand-300 border border-beige-300 dark:border-brand-800/80"
                          >
                            {p.role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Skills */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {t.requiredSkills?.slice(0, 3).map((sk, idx) => (
                      <span key={idx} className="badge-skill text-[10px]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <img
                      src={t.leader?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                      alt="leader"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="truncate max-w-[90px]">{t.leader?.fullName?.split(' ')[0]}</span>
                  </div>

                  <Link
                    to={`/teams/${t._id}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-700 dark:text-brand-300 hover:underline"
                  >
                    <span>View Team</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

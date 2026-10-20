import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Users,
  Sparkles,
  MapPin,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  Send,
  Check,
  Clock,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Flag,
  UserPlus,
  MessageSquare,
  X,
  ChevronDown,
} from 'lucide-react';
import ReportModal from '../components/ReportModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';

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
  'Mobile Developer',
  'Data Science',
  'Business & Pitch',
];

const EXPERIENCE_LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
const COLLAB_MODES = ['All Modes', 'Remote', 'In-person', 'Hybrid'];

export default function DiscoverTeammatesPage() {
  const { user: currentUser } = useAuth();
  const { onlineUserIds } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filter States initialized from URL or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [role, setRole] = useState(searchParams.get('role') || 'All Roles');
  const [experienceLevel, setExperienceLevel] = useState('All Levels');
  const [collaborationMode, setCollaborationMode] = useState('All Modes');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [lookingForTeamOnly, setLookingForTeamOnly] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');

  // Modals state
  const [connectModalUser, setConnectModalUser] = useState(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [reportModalUser, setReportModalUser] = useState(null);
  const [inviteModalUser, setInviteModalUser] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamToInvite, setSelectedTeamToInvite] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role && role !== 'All Roles') params.append('role', role);
      if (experienceLevel && experienceLevel !== 'All Levels') params.append('experienceLevel', experienceLevel);
      if (collaborationMode && collaborationMode !== 'All Modes') params.append('collaborationMode', collaborationMode);
      if (selectedSkill) params.append('skill', selectedSkill);
      if (lookingForTeamOnly) params.append('lookingForTeam', 'true');
      params.append('sort', sortBy);
      params.append('page', pagination.page);

      const res = await apiClient.get(`/users?${params.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load teammates:', err);
      toast.error('Failed to load teammates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, experienceLevel, collaborationMode, selectedSkill, lookingForTeamOnly, sortBy, pagination.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleBookmarkToggle = async (userId) => {
    try {
      const res = await apiClient.post('/bookmarks/toggle', {
        itemType: 'user',
        itemId: userId,
      });
      if (res.data?.success) {
        setUsers(prev =>
          prev.map(u => (u._id === userId ? { ...u, isBookmarked: res.data.isBookmarked } : u))
        );
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Bookmark update failed');
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!connectModalUser) return;
    try {
      const res = await apiClient.post('/connections/request', {
        recipientId: connectModalUser._id,
        message: connectMessage,
      });
      if (res.data?.success) {
        toast.success('Connection request sent!');
        setUsers(prev =>
          prev.map(u =>
            u._id === connectModalUser._id
              ? { ...u, connectionStatus: { status: 'pending', isRequester: true, connectionId: res.data.connection._id } }
              : u
          )
        );
        setConnectModalUser(null);
        setConnectMessage('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleWithdrawRequest = async (connectionId, userId) => {
    try {
      const res = await apiClient.delete(`/connections/requests/${connectionId}`);
      if (res.data?.success) {
        toast.success('Request withdrawn');
        setUsers(prev =>
          prev.map(u =>
            u._id === userId ? { ...u, connectionStatus: { status: 'none' } } : u
          )
        );
      }
    } catch (err) {
      toast.error('Failed to withdraw request');
    }
  };

  const openInviteModal = async (user) => {
    setInviteModalUser(user);
    try {
      const res = await apiClient.get('/teams/my-teams');
      if (res.data?.success) {
        const leaderTeams = (res.data.teams || []).filter(
          t => t.leader?._id?.toString() === currentUser?._id?.toString()
        );
        setMyTeams(leaderTeams);
        if (leaderTeams.length > 0) setSelectedTeamToInvite(leaderTeams[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedTeamToInvite || !inviteModalUser) return;
    try {
      const res = await apiClient.post(`/teams/${selectedTeamToInvite}/invite`, {
        userId: inviteModalUser._id,
        position: inviteModalUser.preferredRoles?.[0] || 'Member',
      });
      if (res.data?.success) {
        toast.success(`Invitation sent to ${inviteModalUser.fullName}!`);
        setInviteModalUser(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Discover Compatible Teammates</span>
            <Sparkles className="w-5 h-5 text-brand-500" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse verified innovators, filter by specialized roles, and connect instantly.
          </p>
        </div>

        {/* Sort Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          >
            <option value="relevance">Smart Compatibility Match</option>
            <option value="recently_active">Recently Active</option>
            <option value="newest">Newest Members</option>
          </select>
        </div>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill, university, or keyword (e.g., PyTorch, Figma, Berkeley)..."
            className="w-full pl-10 pr-24 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r === 'All Roles' ? 'all' : r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl === 'All Levels' ? 'all' : lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Collaboration Mode
            </label>
            <select
              value={collaborationMode}
              onChange={(e) => setCollaborationMode(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              {COLLAB_MODES.map((m) => (
                <option key={m} value={m === 'All Modes' ? 'all' : m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={lookingForTeamOnly}
                onChange={(e) => setLookingForTeamOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 dark:bg-dark-surface border-gray-300 dark:border-dark-border"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Looking for team only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Teammate Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-gray-200 dark:bg-dark-card animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teammates match your filters"
          description="Try broadening your role, experience, or search terms to see more talented builders."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setRole('All Roles');
            setExperienceLevel('All Levels');
            setCollaborationMode('All Modes');
            setSelectedSkill('');
            setLookingForTeamOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((candidate) => {
            const isOnline = onlineUserIds.has(candidate._id.toString()) || candidate.isOnline;
            const match = candidate.compatibility;

            return (
              <div
                key={candidate._id}
                className="p-5 rounded-2xl glass-card flex flex-col justify-between group hover:border-brand-500/50 hover:shadow-lg transition-all"
              >
                <div>
                  {/* Top Bar: Match Score & Bookmark/Report */}
                  <div className="flex items-center justify-between mb-3">
                    {match ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {match.score}% Match
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-gray-400">
                        {candidate.experienceLevel}
                      </span>
                    )}

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleBookmarkToggle(candidate._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          candidate.isBookmarked
                            ? 'text-brand-600 bg-brand-50 dark:bg-brand-950/50'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-surface'
                        }`}
                        title={candidate.isBookmarked ? 'Remove bookmark' : 'Save profile'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => setReportModalUser(candidate)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                        title="Report user"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start space-x-3.5 mb-3">
                    <div className="relative shrink-0">
                      <img
                        src={candidate.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={candidate.fullName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/20"
                      />
                      {/* Online Indicator */}
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-dark-card ${
                          isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                        title={isOnline ? 'Online now' : 'Offline'}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/u/${candidate.username}`}
                        className="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors line-clamp-1"
                      >
                        {candidate.fullName}
                      </Link>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium truncate">
                        {candidate.roleTitle}
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="flex items-center space-x-1 truncate">
                          <GraduationCap className="w-3 h-3 shrink-0" />
                          <span className="truncate">{candidate.college || 'Developer'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Explainable Match Headline (Section 6) */}
                  {match?.headline && (
                    <div className="mb-3 p-2 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/40 text-[11px] text-brand-700 dark:text-brand-300 font-medium leading-relaxed">
                      💡 {match.headline}
                    </div>
                  )}

                  {/* Short Bio */}
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {candidate.bio || 'Available for upcoming hackathons. Passionate about building impactful projects.'}
                  </p>

                  {/* Skills Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {candidate.skills?.slice(0, 4).map((sk, idx) => (
                      <span key={idx} className="badge-skill text-[10px]">
                        {sk}
                      </span>
                    ))}
                    {candidate.skills?.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] text-gray-400 bg-gray-100 dark:bg-dark-surface font-medium">
                        +{candidate.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Metadata Row: Availability & Location */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-3 pt-2 border-t border-gray-100 dark:border-dark-border">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{candidate.availability || 'Flexible'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="truncate max-w-[120px]">{candidate.location || 'Remote'}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between gap-2">
                  <Link
                    to={`/u/${candidate.username}`}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-colors"
                  >
                    View Profile
                  </Link>

                  {/* Connection Button Logic */}
                  {candidate.connectionStatus?.status === 'accepted' ? (
                    <div className="flex items-center space-x-1.5">
                      <Link
                        to="/chat"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </Link>
                      <button
                        onClick={() => openInviteModal(candidate)}
                        className="p-1.5 rounded-lg text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 transition-colors"
                        title="Invite to team"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : candidate.connectionStatus?.status === 'pending' ? (
                    candidate.connectionStatus.isRequester ? (
                      <button
                        onClick={() => handleWithdrawRequest(candidate.connectionStatus.connectionId, candidate._id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 transition-colors"
                        title="Click to withdraw request"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Request Sent</span>
                      </button>
                    ) : (
                      <Link
                        to="/connections"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      >
                        <span>Respond</span>
                      </Link>
                    )
                  ) : (
                    <button
                      onClick={() => setConnectModalUser(candidate)}
                      className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 pt-6">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3.5 py-1.5 text-xs text-gray-500 font-medium">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Connect Modal */}
      {connectModalUser && (
        <Modal
          isOpen={!!connectModalUser}
          onClose={() => setConnectModalUser(null)}
          title={`Connect with ${connectModalUser.fullName}`}
        >
          <form onSubmit={handleSendRequest} className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border">
              <img
                src={connectModalUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                alt={connectModalUser.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {connectModalUser.fullName}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {connectModalUser.roleTitle}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Include a personal message (optional)
              </label>
              <textarea
                rows={3}
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                placeholder="Hey! Saw your impressive background in Python & AI. Would love to team up for the upcoming hackathon!"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setConnectModalUser(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invite To Team Modal */}
      {inviteModalUser && (
        <Modal
          isOpen={!!inviteModalUser}
          onClose={() => setInviteModalUser(null)}
          title={`Invite ${inviteModalUser.fullName} to your team`}
        >
          <form onSubmit={handleSendInvite} className="space-y-4">
            {myTeams.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-500">
                You are not the leader of any open teams. Create a team first to invite members!
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Select Your Team
                  </label>
                  <select
                    value={selectedTeamToInvite}
                    onChange={(e) => setSelectedTeamToInvite(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white"
                  >
                    {myTeams.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.members?.length || 1}/{t.desiredSize} members)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalUser(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-glow"
                  >
                    Send Invitation
                  </button>
                </div>
              </>
            )}
          </form>
        </Modal>
      )}

      {/* Report Modal */}
      {reportModalUser && (
        <ReportModal
          isOpen={!!reportModalUser}
          onClose={() => setReportModalUser(null)}
          targetType="user"
          targetId={reportModalUser._id}
          targetName={reportModalUser.fullName}
        />
      )}
    </div>
  );
}

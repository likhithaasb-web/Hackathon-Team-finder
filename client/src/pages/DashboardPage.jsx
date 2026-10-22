import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import {
  Users,
  Calendar,
  FolderGit2,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Trophy,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import EmptyState from '../components/EmptyState.jsx';
import { TeammateCardSkeleton, TeamCardSkeleton, HackathonCardSkeleton } from '../components/Skeleton.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const { notifications } = useSocket();

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [conversations, setConversations] = useState([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRespondInvitation = async (invId, action) => {
    try {
      const res = await apiClient.put(`/teams/invitations/${invId}`, { action });
      if (res.data?.success) {
        toast.success(action === 'accept' ? 'Joined team successfully! 🎉' : 'Invitation declined.');
        setInvitations(prev => prev.filter(i => i._id !== invId));
        if (action === 'accept') {
          const teamsRes = await apiClient.get('/teams/my-teams');
          if (teamsRes.data?.success) setMyTeams(teamsRes.data.teams || []);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update invitation.');
    }
  };

  const handleRespondRequest = async (reqId, action) => {
    try {
      const res = await apiClient.put(`/connections/requests/${reqId}`, { action });
      if (res.data?.success) {
        toast.success(action === 'accept' ? 'Connected with teammate! 🤝' : 'Request declined.');
        setIncomingRequests(prev => prev.filter(r => r._id !== reqId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request.');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [recRes, hackRes, teamsRes, invRes, reqRes, convRes] = await Promise.all([
          apiClient.get('/users/recommendations'),
          apiClient.get('/hackathons/featured'),
          apiClient.get('/teams/my-teams'),
          apiClient.get('/teams/my-invitations'),
          apiClient.get('/connections/requests'),
          apiClient.get('/chat/conversations'),
        ]);

        if (recRes.data?.success) setRecommendations(recRes.data.recommendations || []);
        if (hackRes.data?.success) setHackathons(hackRes.data.hackathons || []);
        if (teamsRes.data?.success) setMyTeams(teamsRes.data.teams || []);
        if (invRes.data?.success) setInvitations(invRes.data.invitations || []);
        if (reqRes.data?.success) setIncomingRequests(reqRes.data.incoming || []);
        if (convRes.data?.success) setConversations(convRes.data.conversations || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Demo user velocity trend data for chart
  const activityData = [
    { day: 'Mon', connections: 2, messages: 5 },
    { day: 'Tue', connections: 4, messages: 12 },
    { day: 'Wed', connections: 3, messages: 8 },
    { day: 'Thu', connections: 6, messages: 19 },
    { day: 'Fri', connections: 8, messages: 24 },
    { day: 'Sat', connections: 12, messages: 35 },
    { day: 'Sun', connections: 15, messages: 42 },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Header Banner & Profile Completion */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white shadow-royal border border-brand-700/40 relative overflow-hidden">
        {/* Glow ambient background circles with Royal Blue and warm Beige */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-beige-100/20 text-beige-100 border border-beige-200/30 backdrop-blur-md mb-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ready for the next hackathon</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.fullName || 'Innovator'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-beige-200/90 mt-1 max-w-xl">
              {user?.roleTitle || 'Developer'} • {user?.college || user?.location || 'HackMate Innovator'}
            </p>
          </div>

          {/* Profile Completeness Box with Interactive Checklist */}
          <div className="p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 min-w-[260px] sm:max-w-xs w-full">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-beige-200">Profile Completeness</span>
              <span className="font-extrabold text-white text-sm">
                {user?.profileCompleteness || 60}%
              </span>
            </div>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-300 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${user?.profileCompleteness || 60}%` }}
              />
            </div>

            {/* Checklist Micro-Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/10 text-[10px]">
              <Link
                to="/profile/edit"
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border transition-colors ${
                  user?.bio
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    : 'bg-white/10 text-beige-200 border-white/15 hover:bg-white/20'
                }`}
              >
                {user?.bio ? <Check className="w-2.5 h-2.5" /> : <span>+</span>}
                <span>Bio</span>
              </Link>
              <Link
                to="/profile/edit"
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border transition-colors ${
                  (user?.skills?.length || 0) >= 3
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    : 'bg-white/10 text-beige-200 border-white/15 hover:bg-white/20'
                }`}
              >
                {(user?.skills?.length || 0) >= 3 ? <Check className="w-2.5 h-2.5" /> : <span>+</span>}
                <span>Skills ({(user?.skills?.length || 0)}/3)</span>
              </Link>
              <Link
                to="/profile/edit"
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border transition-colors ${
                  user?.githubUrl
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    : 'bg-white/10 text-beige-200 border-white/15 hover:bg-white/20'
                }`}
              >
                {user?.githubUrl ? <Check className="w-2.5 h-2.5" /> : <span>+</span>}
                <span>GitHub</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap gap-2.5">
          <Link
            to="/discover"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-beige-50 text-brand-900 hover:bg-white transition-colors shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-brand-700" />
            <span>Discover Teammates</span>
          </Link>
          <Link
            to="/teams/create"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-950/60 hover:bg-brand-950 text-white border border-beige-200/20 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-beige-300" />
            <span>Create New Team</span>
          </Link>
          <Link
            to="/hackathons"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-950/60 hover:bg-brand-950 text-white border border-beige-200/20 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-beige-300" />
            <span>Explore Hackathons</span>
          </Link>
        </div>
      </div>

      {/* 2. Urgent Action Banners: Pending Invitations & Incoming Requests */}
      {(invitations.length > 0 || incomingRequests.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invitations.length > 0 && (
            <div className="p-4 rounded-2xl bg-beige-100/80 dark:bg-brand-950/40 border border-beige-300 dark:border-brand-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-royal">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {invitations.length} Team Invitation{invitations.length > 1 ? 's' : ''}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Placement offer: <strong>{invitations[0]?.team?.name}</strong>
                    </p>
                  </div>
                </div>
                <Link
                  to="/teams/my-teams"
                  className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 hover:underline"
                >
                  View All ({invitations.length})
                </Link>
              </div>

              {/* Top Invitation Inline Action */}
              <div className="pt-2 border-t border-beige-200 dark:border-brand-900/40 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-600 dark:text-gray-300">
                  Role: <span className="font-semibold">{invitations[0]?.position || 'Member'}</span>
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleRespondInvitation(invitations[0]._id, 'reject')}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-beige-200 dark:hover:bg-brand-900/60 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRespondInvitation(invitations[0]._id, 'accept')}
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-royal transition-all"
                  >
                    <Check className="w-3 h-3" />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {incomingRequests.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {incomingRequests.length} Teammate Request{incomingRequests.length > 1 ? 's' : ''}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      From <strong>{incomingRequests[0]?.requester?.fullName}</strong>
                    </p>
                  </div>
                </div>
                <Link
                  to="/connections"
                  className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                >
                  View All ({incomingRequests.length})
                </Link>
              </div>

              {/* Top Request Inline Action */}
              <div className="pt-2 border-t border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-600 dark:text-gray-300 truncate max-w-[160px]">
                  {incomingRequests[0]?.requester?.roleTitle || 'Developer'}
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleRespondRequest(incomingRequests[0]._id, 'reject')}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRespondRequest(incomingRequests[0]._id, 'accept')}
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all"
                  >
                    <Check className="w-3 h-3" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recommended Teammates & My Teams */}
        <div className="lg:col-span-2 space-y-8">
          {/* Smart Recommended Teammates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <span>Smart Teammate Recommendations</span>
                  <Sparkles className="w-4 h-4 text-brand-500" />
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Matched by complementary technical roles and shared domains.
                </p>
              </div>
              <Link
                to="/discover"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TeammateCardSkeleton />
                <TeammateCardSkeleton />
              </div>
            ) : recommendations.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No recommendations yet"
                description="Update your skills and preferred hackathon categories to see smart matching suggestions."
                actionText="Update Profile"
                onAction={() => window.location.href = '/profile/edit'}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map((rec) => (
                  <div
                    key={rec._id}
                    className="p-5 rounded-2xl glass-card flex flex-col justify-between group hover:border-brand-500/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {rec.compatibility?.score || 85}% Match
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {rec.availability || 'Flexible'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 mb-2.5">
                        <img
                          src={rec.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={rec.fullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {rec.fullName}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {rec.roleTitle}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {rec.bio || 'Passionate developer excited to team up for upcoming hackathons.'}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {rec.skills?.slice(0, 3).map((sk, idx) => (
                          <span key={idx} className="badge-skill text-[10px]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs">
                      <span className="text-gray-400 text-[11px] truncate max-w-[150px]">
                        {rec.college || rec.location || 'Remote'}
                      </span>
                      <Link
                        to={`/u/${rec.username}`}
                        className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Active Teams & Workspaces */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  My Teams & Workspaces
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Teams where you are a collaborator or leader.
                </p>
              </div>
              <Link
                to="/teams/create"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Team</span>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TeamCardSkeleton />
                <TeamCardSkeleton />
              </div>
            ) : myTeams.length === 0 ? (
              <EmptyState
                icon={FolderGit2}
                title="You haven't joined any teams yet"
                description="Browse teams recruiting for your skills, or create your own team and invite peers."
                actionText="Explore Teams"
                onAction={() => window.location.href = '/teams'}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myTeams.map((team) => (
                  <div
                    key={team._id}
                    className="p-5 rounded-2xl glass-card flex flex-col justify-between group hover:border-brand-500/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                          {team.collaborationMode}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {team.members?.length || 1}/{team.desiredSize} Members
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        {team.name}
                      </h4>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-2">
                        {team.hackathon?.title || 'Open Hackathon Team'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {team.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {team.members?.slice(0, 4).map((m, i) => (
                          <img
                            key={i}
                            src={m.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                            alt="member"
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-dark-surface object-cover"
                          />
                        ))}
                      </div>
                      <Link
                        to={`/teams/${team._id}/workspace`}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Velocity Chart */}
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Sprint Velocity & Teaming Activity
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Weekly collaboration interactions across messages and connections.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                +38% vs last sprint
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMsgs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Deadlines, Messages & Notifications */}
        <div className="space-y-6">
          {/* Upcoming Hackathon Deadlines */}
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Approaching Deadlines</span>
              </h4>
              <Link to="/hackathons" className="text-xs text-brand-500 hover:underline">
                All events
              </Link>
            </div>

            <div className="space-y-3">
              {hackathons.slice(0, 3).map((h) => (
                <Link
                  key={h._id}
                  to={`/hackathons/${h._id}`}
                  className="block p-3 rounded-xl bg-gray-50/80 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border hover:border-brand-500/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {h.title}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0 ml-2">
                      {h.format}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                    {h.organizer}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Deadline: {new Date(h.registrationDeadline).toLocaleDateString()}</span>
                    <span className="text-brand-500 font-medium">Join Team →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Direct Messages */}
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-brand-500" />
                <span>Recent Messages</span>
              </h4>
              <Link to="/chat" className="text-xs text-brand-500 hover:underline">
                Open Chat
              </Link>
            </div>

            {conversations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No active conversations yet. Connect with a teammate to start chatting!
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 4).map((c) => {
                  const otherParticipant = c.participants?.find(
                    (p) => p._id?.toString() !== user?._id?.toString()
                  );
                  const title = c.type === 'team' ? c.team?.name : otherParticipant?.fullName;
                  const avatar = c.type === 'team'
                    ? c.team?.logoUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80'
                    : otherParticipant?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

                  return (
                    <Link
                      key={c._id}
                      to="/chat"
                      className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
                    >
                      <img
                        src={avatar}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {title || 'Chat'}
                          </p>
                          {c.unreadCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-brand-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {c.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Notification History */}
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Recent Notifications
              </h4>
              <Link to="/notifications" className="text-xs text-brand-500 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 4).map((n) => (
                <div key={n._id} className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 text-xs">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {n.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {n.message}
                  </p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  No new notifications.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

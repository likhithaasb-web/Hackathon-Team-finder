import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  FolderGit2,
  Users,
  Trophy,
  MapPin,
  Clock,
  Calendar,
  Share2,
  UserPlus,
  LogOut,
  Trash2,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Kanban,
  MessageSquare,
} from 'lucide-react';
import Modal from '../components/Modal.jsx';

export default function TeamDetailPage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [pendingInvite, setPendingInvite] = useState(false);
  const [activities, setActivities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyPosition, setApplyPosition] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteConnections, setInviteConnections] = useState([]);
  const [selectedInviteUser, setSelectedInviteUser] = useState('');

  const isLeader = team?.leader?._id?.toString() === currentUser?._id?.toString() || currentUser?.role === 'admin';
  const isMember = !!userRole;

  const fetchTeamDetails = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/teams/${id}`);
      if (res.data?.success) {
        setTeam(res.data.team);
        setUserRole(res.data.userRole);
        setHasApplied(res.data.hasApplied);
        setPendingInvite(res.data.pendingInvite);
        setActivities(res.data.activities || []);
      }

      // If leader, load applications
      if (res.data?.userRole === 'Team Lead' || currentUser?.role === 'admin') {
        const appRes = await apiClient.get(`/teams/${id}/applications`);
        if (appRes.data?.success) {
          setApplications(appRes.data.applications || []);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [id, currentUser?._id]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post(`/teams/${id}/apply`, {
        position: applyPosition || 'Member',
        message: applyMessage,
      });
      if (res.data?.success) {
        toast.success(res.data.message);
        setHasApplied(true);
        setApplyModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const res = await apiClient.put(`/teams/applications/${applicationId}`, { action });
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchTeamDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const openInviteModal = async () => {
    try {
      const res = await apiClient.get('/connections');
      if (res.data?.success) {
        setInviteConnections(res.data.connections || []);
        if (res.data.connections.length > 0) {
          setSelectedInviteUser(res.data.connections[0].user._id);
        }
      }
      setInviteModalOpen(true);
    } catch (err) {
      toast.error('Failed to load connections');
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedInviteUser) return;
    try {
      const res = await apiClient.post(`/teams/${id}/invite`, {
        userId: selectedInviteUser,
        position: 'Member',
      });
      if (res.data?.success) {
        toast.success('Invitation sent to connection!');
        setInviteModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    }
  };

  const handleToggleRecruitment = async () => {
    const nextStatus = team.recruitmentStatus === 'open' ? 'closed' : 'open';
    try {
      const res = await apiClient.put(`/teams/${id}`, { recruitmentStatus: nextStatus });
      if (res.data?.success) {
        setTeam(res.data.team);
        toast.success(`Recruitment ${nextStatus === 'open' ? 'reopened' : 'closed'}`);
      }
    } catch (err) {
      toast.error('Failed to update recruitment status');
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      const res = await apiClient.post(`/teams/${id}/leave`);
      if (res.data?.success) {
        toast.success('You have left the team.');
        navigate('/teams');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave team');
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      const res = await apiClient.delete(`/teams/${id}/members/${memberUserId}`);
      if (res.data?.success) {
        toast.success('Member removed');
        fetchTeamDetails();
      }
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  const handleCopyInviteCode = () => {
    if (!team?.inviteCode) return;
    navigator.clipboard.writeText(team.inviteCode);
    toast.success(`Invite Code ${team.inviteCode} copied!`);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-64 rounded-3xl bg-gray-200 dark:bg-dark-card" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-dark-card" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Team Not Found</h2>
        <Link to="/teams" className="text-brand-600 hover:underline mt-2 inline-block">
          Return to Teams Directory
        </Link>
      </div>
    );
  }

  const unfilledPositions = (team.openPositions || []).filter(p => !p.filled);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-gray-200 dark:border-dark-border shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-800 to-brand-600 flex items-center justify-center text-white shadow-royal text-2xl font-black shrink-0">
              {team.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  {team.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    team.recruitmentStatus === 'open'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-dark-surface'
                  }`}
                >
                  {team.recruitmentStatus === 'open' ? 'Recruiting' : 'Closed'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                {team.hackathon?.title}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isMember && (
              <Link
                to={`/teams/${team._id}/workspace`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow transition-all"
              >
                <Kanban className="w-4 h-4" />
                <span>Enter Workspace</span>
              </Link>
            )}

            {isLeader && (
              <>
                <button
                  onClick={openInviteModal}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 transition-colors"
                >
                  + Invite Teammate
                </button>
                <button
                  onClick={handleToggleRecruitment}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 transition-colors"
                >
                  {team.recruitmentStatus === 'open' ? 'Close Recruitment' : 'Reopen Recruitment'}
                </button>
              </>
            )}

            {!isMember && (
              hasApplied ? (
                <span className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                  Application Pending
                </span>
              ) : team.members?.length >= team.desiredSize ? (
                <span className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 bg-gray-100">
                  Team is Full
                </span>
              ) : (
                <button
                  onClick={() => setApplyModalOpen(true)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow"
                >
                  Apply to Join
                </button>
              )
            )}

            {isMember && !isLeader && (
              <button
                onClick={handleLeaveTeam}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                Leave Team
              </button>
            )}
          </div>
        </div>

        {/* Shareable Invite Code banner */}
        <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Shareable Join Code:</span>
            <code className="font-mono font-bold text-brand-600 dark:text-brand-400 bg-white dark:bg-dark-card px-2.5 py-0.5 rounded border border-gray-200 dark:border-dark-border">
              {team.inviteCode || 'CODE123'}
            </code>
          </div>
          <button
            onClick={handleCopyInviteCode}
            className="inline-flex items-center space-x-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Join Code</span>
          </button>
        </div>

        {/* Overview & Problem Statement */}
        <div className="space-y-3 pt-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {team.description}
          </p>
          {team.problemStatement && (
            <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40">
              <span className="text-xs font-bold text-brand-800 dark:text-brand-300 block mb-1">
                Project Problem Statement:
              </span>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {team.problemStatement}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Leader Review Box: Incoming Applications */}
      {isLeader && applications.length > 0 && (
        <div className="p-6 rounded-2xl glass-card border border-beige-300 dark:border-brand-900/60 bg-beige-100/60 dark:bg-brand-950/30 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-brand-700" />
            <span>Pending Team Applications ({applications.length})</span>
          </h3>

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={app.applicant?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                    alt={app.applicant?.fullName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <Link
                      to={`/u/${app.applicant?.username}`}
                      className="text-xs font-bold text-gray-900 dark:text-white hover:underline"
                    >
                      {app.applicant?.fullName}
                    </Link>
                    <p className="text-[11px] text-brand-600 dark:text-brand-400">
                      Applied for: <strong>{app.position}</strong>
                    </p>
                    {app.message && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        "{app.message}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => handleApplicationAction(app._id, 'reject')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleApplicationAction(app._id, 'accept')}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow"
                  >
                    Accept into Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Members & Open Positions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Members Column */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-brand-500" />
              <span>Current Members ({team.members?.length || 1}/{team.desiredSize})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {team.members?.map((m) => (
              <div
                key={m.user?._id}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={m.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                    alt={m.user?.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/u/${m.user?.username}`}
                      className="text-xs font-bold text-gray-900 dark:text-white hover:underline flex items-center space-x-1"
                    >
                      <span>{m.user?.fullName}</span>
                      {m.user?._id === team.leader?._id && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950 px-1 rounded">
                          LEAD
                        </span>
                      )}
                    </Link>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {m.role || 'Member'}
                    </p>
                  </div>
                </div>

                {isLeader && m.user?._id !== team.leader?._id && (
                  <button
                    onClick={() => handleRemoveMember(m.user?._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions Column */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Open Positions ({unfilledPositions.length})
            </h3>
          </div>

          {unfilledPositions.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              All planned team positions have been filled!
            </p>
          ) : (
            <div className="space-y-3">
              {unfilledPositions.map((pos, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {pos.role}
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Open
                    </span>
                  </div>
                  {pos.description && (
                    <p className="text-[11px] text-gray-500 mb-2">
                      {pos.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pos.requiredSkills?.map((sk, i) => (
                      <span key={i} className="badge-skill text-[10px]">
                        {sk}
                      </span>
                    ))}
                  </div>

                  {!isMember && (
                    <button
                      onClick={() => {
                        setApplyPosition(pos.role);
                        setApplyModalOpen(true);
                      }}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                    >
                      Apply for this role
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      {activities.length > 0 && (
        <div className="p-6 rounded-2xl glass-card space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
            Team Activity History
          </h3>
          <div className="space-y-2 text-xs">
            {activities.slice(0, 6).map((act) => (
              <div key={act._id} className="flex items-center justify-between text-gray-500">
                <span className="text-gray-800 dark:text-gray-200">
                  <strong>{act.action}:</strong> {act.details}
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(act.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyModalOpen && (
        <Modal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          title={`Apply to join ${team.name}`}
        >
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Target Role
              </label>
              <input
                type="text"
                required
                value={applyPosition}
                onChange={(e) => setApplyPosition(e.target.value)}
                placeholder="e.g. Frontend Engineer, UI/UX"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Pitch message to team lead
              </label>
              <textarea
                rows={3}
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder="Why are you a good fit for this team? Mention your relevant tech stack..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm resize-none"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-glow"
              >
                Submit Application
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invite Connection Modal */}
      {inviteModalOpen && (
        <Modal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          title="Invite a Connected Teammate"
        >
          <form onSubmit={handleSendInvite} className="space-y-4">
            {inviteConnections.length === 0 ? (
              <p className="text-xs text-gray-500 py-3">
                You have no active connections yet. Connect with teammates on the Discover page first!
              </p>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Select Peer
                  </label>
                  <select
                    value={selectedInviteUser}
                    onChange={(e) => setSelectedInviteUser(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm"
                  >
                    {inviteConnections.map((c) => (
                      <option key={c.user._id} value={c.user._id}>
                        {c.user.fullName} ({c.user.roleTitle})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-glow"
                  >
                    Send Team Invite
                  </button>
                </div>
              </>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}

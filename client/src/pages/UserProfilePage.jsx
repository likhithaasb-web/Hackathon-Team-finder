import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import toast from 'react-hot-toast';
import {
  User,
  MapPin,
  GraduationCap,
  Sparkles,
  Trophy,
  Github,
  Linkedin,
  Globe,
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
  UserPlus,
  MessageSquare,
  Flag,
  Share2,
  FolderGit2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import ReportModal from '../components/ReportModal.jsx';
import Modal from '../components/Modal.jsx';

export default function UserProfilePage() {
  const { id, username } = useParams();
  const { user: currentUser } = useAuth();
  const { onlineUserIds } = useSocket();

  const [profile, setProfile] = useState(null);
  const [teams, setTeams] = useState([]);
  const [compatibility, setCompatibility] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'none' });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        if (username) {
          endpoint = `/users/username/${username}`;
        } else if (id) {
          endpoint = `/users/${id}`;
        } else {
          // Current user's own profile
          endpoint = `/users/${currentUser?._id}`;
        }

        const res = await apiClient.get(endpoint);
        if (res.data?.success) {
          setProfile(res.data.user);
          setTeams(res.data.teams || []);
          setCompatibility(res.data.compatibility);
          setConnectionStatus(res.data.connectionStatus || { status: 'none' });
          setIsBookmarked(res.data.isBookmarked || false);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, username, currentUser?._id]);

  const isSelf = currentUser?._id?.toString() === profile?._id?.toString();
  const isOnline = profile && (onlineUserIds.has(profile._id?.toString()) || profile.isOnline);

  const handleBookmarkToggle = async () => {
    if (!profile) return;
    try {
      const res = await apiClient.post('/bookmarks/toggle', {
        itemType: 'user',
        itemId: profile._id,
      });
      if (res.data?.success) {
        setIsBookmarked(res.data.isBookmarked);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Bookmark update failed');
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const res = await apiClient.post('/connections/request', {
        recipientId: profile._id,
        message: connectMessage,
      });
      if (res.data?.success) {
        toast.success('Connection request sent!');
        setConnectionStatus({
          status: 'pending',
          isRequester: true,
          connectionId: res.data.connection?._id,
        });
        setConnectModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile URL copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-64 rounded-3xl bg-gray-200 dark:bg-dark-card" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-dark-card" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The requested user profile does not exist or has been removed.</p>
        <Link to="/discover" className="mt-4 inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Hero Card */}
      <div className="rounded-3xl glass-card overflow-hidden shadow-xl border border-gray-200 dark:border-dark-border">
        {/* Cover pattern */}
        <div className="h-40 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
              title="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {!isSelf && (
              <>
                <button
                  onClick={handleBookmarkToggle}
                  className="p-2 rounded-xl bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark profile'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-brand-300' : ''}`} />
                </button>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="p-2 rounded-xl bg-black/30 backdrop-blur-md text-white hover:text-red-400 hover:bg-black/50 transition-colors"
                  title="Report profile"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="flex items-end space-x-4">
              <div className="relative">
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={profile.fullName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white dark:ring-dark-surface shadow-lg"
                />
                <span
                  className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ring-2 ring-white dark:ring-dark-surface ${
                    isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}
                  title={isOnline ? 'Online' : 'Offline'}
                />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {profile.fullName}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @{profile.username}
                </p>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-1">
                  {profile.roleTitle}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 self-start sm:self-end">
              {isSelf ? (
                <Link
                  to="/profile/edit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-glow transition-all"
                >
                  Edit My Profile
                </Link>
              ) : connectionStatus.status === 'accepted' ? (
                <Link
                  to="/chat"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-glow transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Direct Message</span>
                </Link>
              ) : connectionStatus.status === 'pending' ? (
                <span className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Request Pending</span>
                </span>
              ) : (
                <button
                  onClick={() => setConnectModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Connect / Teammate Request</span>
                </button>
              )}
            </div>
          </div>

          {/* Academic & Location Metadata Pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-dark-border">
            {profile.college && (
              <span className="flex items-center space-x-1">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <span>{profile.college} {profile.yearOfStudy ? `(${profile.yearOfStudy})` : ''}</span>
              </span>
            )}
            {profile.location && (
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{profile.location}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{profile.availability}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              {profile.collaborationMode}
            </span>
            {profile.lookingForTeam && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                Open to Teaming
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Compatibility Breakdown (Section 6) */}
      {!isSelf && compatibility && (
        <div className="p-6 rounded-2xl glass-card border border-brand-200 dark:border-brand-800/80 bg-brand-50/20 dark:bg-brand-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Compatibility Analysis with Your Profile</span>
            </h3>
            <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500 text-white shadow-sm">
              {compatibility.score}% Match
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
            💡 {compatibility.headline}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {compatibility.reasons?.map((r, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Profile Grid: Bio, Skills, Experience, Projects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Bio, Previous Hackathons, Teams */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              About & Hackathon Philosophy
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {profile.bio || 'This builder hasn’t written a bio yet.'}
            </p>
          </div>

          {/* Previous Hackathons & Projects */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Previous Hackathons & Highlights</span>
            </h3>

            {profile.previousHackathons?.length === 0 ? (
              <p className="text-xs text-gray-500">No previous hackathons listed yet.</p>
            ) : (
              <div className="space-y-3">
                {profile.previousHackathons?.map((h, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {h.name} {h.year ? `(${h.year})` : ''}
                      </h4>
                      {h.prize && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          🏆 {h.prize}
                        </span>
                      )}
                    </div>
                    {h.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {h.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teams user belongs to */}
          {teams.length > 0 && (
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <FolderGit2 className="w-5 h-5 text-brand-500" />
                <span>Active Teams</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map((t) => (
                  <Link
                    key={t._id}
                    to={`/teams/${t._id}`}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border hover:border-brand-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {t.name}
                      </h4>
                      <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                        {t.hackathon?.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2">
                      View team →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Technical Skills, Preferred Roles, Links */}
        <div className="space-y-6">
          {/* Technical Skills */}
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Skills & Frameworks
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills?.map((sk, idx) => (
                <span key={idx} className="badge-skill text-xs">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Roles */}
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Target Team Roles
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.preferredRoles?.map((r, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-dark-surface text-gray-800 dark:text-gray-200"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Hackathon Categories */}
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Domain Interests
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.preferredHackathonCategories?.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50/50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/40"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Online Profiles
            </h3>
            <div className="space-y-2 text-xs">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span className="truncate">{profile.githubUrl.replace('https://', '')}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-blue-500" />
                  <span className="truncate">{profile.linkedinUrl.replace('https://', '')}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors"
                >
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">{profile.portfolioUrl.replace('https://', '')}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {connectModalOpen && (
        <Modal
          isOpen={connectModalOpen}
          onClose={() => setConnectModalOpen(false)}
          title={`Connect with ${profile.fullName}`}
        >
          <form onSubmit={handleSendRequest} className="space-y-4">
            <p className="text-xs text-gray-500">
              Send a personalized message explaining why you'd like to collaborate.
            </p>
            <textarea
              rows={3}
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              placeholder="Hi! I saw your profile and would love to team up for upcoming hackathons..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setConnectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-glow"
              >
                Send Request
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="user"
          targetId={profile._id}
          targetName={profile.fullName}
        />
      )}
    </div>
  );
}

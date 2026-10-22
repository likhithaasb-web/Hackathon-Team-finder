import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
  Bookmark,
  PlusCircle,
  ExternalLink,
  Users,
} from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import { HackathonCardSkeleton } from '../components/Skeleton.jsx';

const FORMATS = ['All Formats', 'Online', 'In-person', 'Hybrid'];
const STATUSES = ['All Statuses', 'upcoming', 'ongoing', 'completed'];
const THEMES = ['All Themes', 'AI', 'Web3', 'Sustainability', 'FinTech', 'Open Innovation'];

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState('All Formats');
  const [status, setStatus] = useState('All Statuses');
  const [theme, setTheme] = useState('All Themes');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const diffMs = new Date(deadline) - new Date();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Closed', urgent: false };
    if (diffDays === 0) return { label: 'Closes today!', urgent: true };
    if (diffDays === 1) return { label: '1 day left', urgent: true };
    if (diffDays <= 3) return { label: `${diffDays} days left`, urgent: true };
    return { label: `${diffDays} days left`, urgent: false };
  };

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (format && format !== 'All Formats') params.append('format', format);
      if (status && status !== 'All Statuses') params.append('status', status);
      if (theme && theme !== 'All Themes') params.append('theme', theme);
      params.append('page', pagination.page);

      const res = await apiClient.get(`/hackathons?${params.toString()}`);
      if (res.data?.success) {
        setHackathons(res.data.hackathons || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [format, status, theme, pagination.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHackathons();
  };

  const handleBookmarkToggle = async (hackathonId) => {
    try {
      const res = await apiClient.post('/bookmarks/toggle', {
        itemType: 'hackathon',
        itemId: hackathonId,
      });
      if (res.data?.success) {
        setHackathons(prev =>
          prev.map(h => (h._id === hackathonId ? { ...h, isBookmarked: res.data.isBookmarked } : h))
        );
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Bookmark toggle failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Hackathon Directory</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Discover premier collegiate and global hackathons, track deadlines, and recruit teams.
          </p>
        </div>
        <Link
          to="/teams/create"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-royal self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Team for Hackathon</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        {/* Quick Domain Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {THEMES.map((t) => {
            const isSelected = theme === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-brand-700 text-white border-brand-700 shadow-royal'
                    : 'bg-beige-50/70 dark:bg-dark-surface text-gray-700 dark:text-gray-300 border-beige-300/80 dark:border-dark-border hover:border-brand-500/40'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hackathon name, themes (AI, Web3, Climate), location, or organizer..."
            className="w-full pl-10 pr-24 py-2.5 bg-beige-50/70 dark:bg-dark-surface border border-beige-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-600"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 shadow-royal transition-all"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-beige-50/50 dark:bg-dark-surface border border-beige-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f === 'All Formats' ? 'all' : f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Event Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s === 'All Statuses' ? 'all' : s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Domain / Track
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white"
            >
              <option value="All Themes">All Themes</option>
              <option value="AI">AI & Machine Learning</option>
              <option value="Web3">Web3 & Blockchain</option>
              <option value="Sustainability">Sustainability</option>
              <option value="FinTech">FinTech</option>
              <option value="Open Innovation">Open Innovation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <HackathonCardSkeleton key={n} />
          ))}
        </div>
      ) : hackathons.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No hackathons found"
          description="Try selecting different filters or search terms."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map((h) => {
            const countdown = getDaysRemaining(h.registrationDeadline);

            return (
              <div
                key={h._id}
                className="rounded-2xl glass-card overflow-hidden flex flex-col justify-between group hover:border-brand-500/50 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="h-44 w-full relative overflow-hidden bg-gray-200 dark:bg-dark-card">
                    <img
                      src={h.bannerUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'}
                      alt={h.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {h.format}
                      </span>
                      {countdown && (
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            countdown.urgent
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-black/60 backdrop-blur-md text-beige-200 border border-white/20'
                          }`}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          {countdown.label}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleBookmarkToggle(h._id)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                      title={h.isBookmarked ? 'Remove bookmark' : 'Bookmark hackathon'}
                    >
                      <Bookmark className={`w-4 h-4 ${h.isBookmarked ? 'fill-current text-brand-300' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-1">
                      {h.organizer}
                    </p>
                    <Link
                      to={`/hackathons/${h._id}`}
                      className="text-lg font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors line-clamp-1 mb-2 block"
                    >
                      {h.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                      {h.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 mb-4">
                      <div className="flex items-center space-x-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold">{h.prizePool}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{h.location}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{new Date(h.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Teams: {h.minTeamSize}-{h.maxTeamSize} devs</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {h.themes?.map((t, idx) => (
                        <span key={idx} className="badge-skill text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-gray-100 dark:border-dark-border bg-beige-50/60 dark:bg-dark-card/50 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Reg deadline: <strong>{new Date(h.registrationDeadline).toLocaleDateString()}</strong>
                  </span>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/hackathons/${h._id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-700 dark:text-brand-300 hover:bg-beige-100 dark:hover:bg-brand-950/40 transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/teams/create?hackathonId=${h._id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-royal transition-all"
                    >
                      Create Team
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

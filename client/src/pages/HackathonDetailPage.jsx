import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Bookmark,
  Share2,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export default function HackathonDetailPage() {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchHackathon = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/hackathons/${id}`);
        if (res.data?.success) {
          setHackathon(res.data.hackathon);
          setTeams(res.data.teams || []);
          setIsBookmarked(res.data.isBookmarked || false);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load hackathon details');
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [id]);

  // Countdown calculation
  useEffect(() => {
    if (!hackathon?.registrationDeadline) return;

    const interval = setInterval(() => {
      const difference = +new Date(hackathon.registrationDeadline) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hackathon?.registrationDeadline]);

  const handleBookmarkToggle = async () => {
    try {
      const res = await apiClient.post('/bookmarks/toggle', {
        itemType: 'hackathon',
        itemId: hackathon._id,
      });
      if (res.data?.success) {
        setIsBookmarked(res.data.isBookmarked);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Bookmark update failed');
    }
  };

  const handleAddToCalendar = () => {
    if (!hackathon) return;
    const startTime = new Date(hackathon.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTime = new Date(hackathon.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      hackathon.title
    )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
      hackathon.description
    )}&location=${encodeURIComponent(hackathon.location)}`;

    window.open(googleCalendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-64 rounded-3xl bg-gray-200 dark:bg-dark-card" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-dark-card" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Hackathon Not Found</h2>
        <Link to="/hackathons" className="text-brand-600 hover:underline mt-2 inline-block">
          Return to Hackathon Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner & Hero Card */}
      <div className="rounded-3xl glass-card overflow-hidden shadow-xl border border-gray-200 dark:border-dark-border">
        <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-dark-bg">
          <img
            src={hackathon.bannerUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80'}
            alt={hackathon.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Quick Controls */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button
              onClick={handleAddToCalendar}
              className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
              title="Add to Google Calendar"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Add to Calendar</span>
            </button>
            <button
              onClick={handleBookmarkToggle}
              className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-brand-400' : ''}`} />
            </button>
          </div>

          {/* Title & Metadata on Cover */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-brand-600/90 backdrop-blur-sm">
                {hackathon.format}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/20 backdrop-blur-sm">
                {hackathon.organizer}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {hackathon.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 flex items-center space-x-4">
              <span>{hackathon.location}</span>
              <span>•</span>
              <span>Prize Pool: <strong>{hackathon.prizePool}</strong></span>
            </p>
          </div>
        </div>

        {/* Live Countdown & Primary Actions Bar */}
        <div className="p-6 bg-brand-50/60 dark:bg-brand-950/30 border-b border-gray-200 dark:border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300 flex items-center space-x-1.5">
              <Clock className="w-4 h-4" />
              <span>Registration Deadline Countdown</span>
            </span>
            <div className="flex items-center space-x-3 mt-1.5 font-mono text-gray-900 dark:text-white">
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-bold">{timeLeft.days}</span>
                <span className="block text-[10px] text-gray-400 font-sans">DAYS</span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-bold">{timeLeft.hours}</span>
                <span className="block text-[10px] text-gray-400 font-sans">HOURS</span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-bold">{timeLeft.minutes}</span>
                <span className="block text-[10px] text-gray-400 font-sans">MINS</span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-bold">{timeLeft.seconds}</span>
                <span className="block text-[10px] text-gray-400 font-sans">SECS</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hackathon.officialUrl && (
              <a
                href={hackathon.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:bg-gray-50 transition-colors"
              >
                <span>Official Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <Link
              to={`/teams/create?hackathonId=${hackathon._id}`}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Team for Event</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Details & Active Teams */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Prizes, Eligibility */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Event Overview & Themes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {hackathon.description}
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Tracks & Problem Themes
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {hackathon.themes?.map((t, idx) => (
                  <span key={idx} className="badge-skill text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Prizes Section */}
          {hackathon.prizes?.length > 0 && (
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Prizes & Awards</span>
              </h3>
              <div className="space-y-3">
                {hackathon.prizes.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {p.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {p.description}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                      {p.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams Formed for This Hackathon */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-brand-500" />
                  <span>Teams Registered for this Event ({teams.length})</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Join an existing team looking for your skill set!
                </p>
              </div>
              <Link
                to={`/teams/create?hackathonId=${hackathon._id}`}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                + Create Team
              </Link>
            </div>

            {teams.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">
                No teams registered yet. Be the first to start a team!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map((t) => (
                  <Link
                    key={t._id}
                    to={`/teams/${t._id}`}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border hover:border-brand-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {t.name}
                        </span>
                        <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                          {t.members?.length || 1}/{t.desiredSize} members
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {t.description}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mt-3">
                      View Open Positions →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Specs */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
              Important Dates & Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5">Start Date</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(hackathon.startDate).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">End Date</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(hackathon.endDate).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Registration Closes</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {new Date(hackathon.registrationDeadline).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Team Size Limits</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {hackathon.minTeamSize} to {hackathon.maxTeamSize} developers
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Eligibility</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {hackathon.eligibility}
                </span>
              </div>
              {hackathon.contactEmail && (
                <div>
                  <span className="text-gray-400 block mb-0.5">Organizer Contact</span>
                  <a href={`mailto:${hackathon.contactEmail}`} className="text-brand-600 hover:underline">
                    {hackathon.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

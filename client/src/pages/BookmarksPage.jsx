import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import {
  Bookmark,
  Users,
  FolderGit2,
  Calendar,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';

export default function BookmarksPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [bookmarks, setBookmarks] = useState({ users: [], teams: [], hackathons: [] });
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/bookmarks');
      if (res.data?.success) {
        setBookmarks(res.data.bookmarks || { users: [], teams: [], hackathons: [] });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (itemType, itemId) => {
    try {
      const res = await apiClient.post('/bookmarks/toggle', { itemType, itemId });
      if (res.data?.success) {
        toast.success('Removed from bookmarks');
        setBookmarks(prev => {
          const listKey = itemType === 'user' ? 'users' : itemType === 'team' ? 'teams' : 'hackathons';
          return {
            ...prev,
            [listKey]: prev[listKey].filter(item => item._id !== itemId),
          };
        });
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
          <span>Saved Bookmarks</span>
          <Bookmark className="w-5 h-5 text-brand-500 fill-current" />
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Quickly access your shortlisted teammates, teams, and target hackathons.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-dark-border space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'users' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'
          }`}
        >
          <span>Saved Teammates ({bookmarks.users?.length || 0})</span>
          {activeTab === 'users' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'teams' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'
          }`}
        >
          <span>Saved Teams ({bookmarks.teams?.length || 0})</span>
          {activeTab === 'teams' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
        </button>

        <button
          onClick={() => setActiveTab('hackathons')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'hackathons' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'
          }`}
        >
          <span>Saved Hackathons ({bookmarks.hackathons?.length || 0})</span>
          {activeTab === 'hackathons' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-40 rounded-2xl bg-gray-200 dark:bg-dark-card animate-pulse" />
      ) : activeTab === 'users' ? (
        bookmarks.users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No saved teammates"
            description="Bookmark developers and designers from the discovery page to compare and contact later."
            actionText="Discover Teammates"
            onAction={() => window.location.href = '/discover'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bookmarks.users.map((u) => (
              <div key={u._id} className="p-4 rounded-2xl glass-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2.5">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                      alt={u.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <Link to={`/u/${u.username}`} className="text-xs font-bold text-gray-900 dark:text-white hover:underline block truncate">
                        {u.fullName}
                      </Link>
                      <p className="text-[11px] text-gray-500 truncate">{u.roleTitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {u.skills?.slice(0, 3).map((sk, i) => (
                      <span key={i} className="badge-skill text-[10px]">{sk}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs">
                  <Link to={`/u/${u.username}`} className="text-brand-600 font-semibold hover:underline">
                    View Profile →
                  </Link>
                  <button
                    onClick={() => handleRemove('user', u._id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'teams' ? (
        bookmarks.teams.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No saved teams"
            description="Bookmark teams you are considering joining."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookmarks.teams.map((t) => (
              <div key={t._id} className="p-4 rounded-2xl glass-card flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-xs text-brand-600 mb-2">{t.hackathon?.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs">
                  <Link to={`/teams/${t._id}`} className="text-brand-600 font-semibold hover:underline">
                    View Team →
                  </Link>
                  <button
                    onClick={() => handleRemove('team', t._id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        bookmarks.hackathons.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No saved hackathons"
            description="Bookmark upcoming events from the hackathon directory to track their deadlines."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookmarks.hackathons.map((h) => (
              <div key={h._id} className="p-4 rounded-2xl glass-card flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{h.title}</h4>
                  <p className="text-xs text-gray-500 mb-2">{h.organizer} • {h.format}</p>
                  <p className="text-xs text-amber-600 font-semibold">Prize: {h.prizePool}</p>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs">
                  <Link to={`/hackathons/${h._id}`} className="text-brand-600 font-semibold hover:underline">
                    Event Details →
                  </Link>
                  <button
                    onClick={() => handleRemove('hackathon', h._id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

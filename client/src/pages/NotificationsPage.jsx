import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import { useSocket } from '../context/SocketContext.jsx';
import toast from 'react-hot-toast';
import {
  Bell,
  Check,
  Trash2,
  Users,
  FolderGit2,
  MessageSquare,
  Clock,
  Filter,
} from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';

export default function NotificationsPage() {
  const { markAllNotificationsRead, markNotificationRead } = useSocket();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'teams' | 'connections'

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/notifications?limit=50');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif._id);
    if (notif.data?.teamId) {
      navigate(`/teams/${notif.data.teamId}`);
    } else if (notif.data?.conversationId) {
      navigate('/chat');
    } else if (notif.data?.requesterId || notif.data?.userId) {
      navigate('/connections');
    } else if (notif.data?.hackathonId) {
      navigate(`/hackathons/${notif.data.hackathonId}`);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'teams') return n.type?.includes('team') || n.type?.includes('application');
    if (filter === 'connections') return n.type?.includes('request') || n.type?.includes('connection');
    return true;
  });

  const getNotificationIcon = (type) => {
    if (type?.includes('team') || type?.includes('application')) {
      return <FolderGit2 className="w-5 h-5 text-brand-700 dark:text-brand-300" />;
    }
    if (type?.includes('request') || type?.includes('connection')) {
      return <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (type?.includes('message')) {
      return <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
    return <Bell className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Notifications Hub</span>
            <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time updates on team invitations, connection requests, and deadline reminders.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleMarkAll}
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-brand-700 dark:text-brand-300 bg-beige-100 dark:bg-brand-950/60 hover:bg-beige-200 transition-colors border border-beige-300 dark:border-brand-900/40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-dark-border pb-3">
        {[
          { key: 'all', label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${notifications.filter(n => !n.isRead).length})` },
          { key: 'teams', label: 'Teams & Invites' },
          { key: 'connections', label: 'Teammate Requests' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.key
                ? 'bg-brand-700 text-white shadow-royal'
                : 'text-gray-600 dark:text-gray-400 hover:bg-beige-100 dark:hover:bg-dark-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-20 rounded-2xl bg-gray-200 dark:bg-dark-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications to show"
          description={
            filter === 'unread'
              ? 'All your notifications are marked read.'
              : 'You have no recent notifications in this category.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl glass-card flex items-start justify-between cursor-pointer group hover:border-brand-500/50 hover:shadow-sm transition-all ${
                !n.isRead ? 'bg-beige-50/80 dark:bg-brand-950/30 border-l-4 border-l-brand-700' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-beige-100 dark:bg-dark-surface border border-beige-200 dark:border-dark-border flex items-center justify-center shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(n._id, e)}
                className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

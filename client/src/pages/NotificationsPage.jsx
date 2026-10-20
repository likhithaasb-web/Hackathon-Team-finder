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
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

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

  const filtered = notifications.filter(n => (filter === 'unread' ? !n.isRead : true));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Notifications Hub</span>
            <Bell className="w-5 h-5 text-brand-500" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time updates on team invitations, connection requests, and deadline reminders.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300'
            }`}
          >
            {filter === 'unread' ? 'Showing Unread' : 'Filter: Unread'}
          </button>
          <button
            onClick={handleMarkAll}
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 hover:bg-brand-100 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-20 rounded-2xl bg-gray-200 dark:bg-dark-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications to show"
          description={filter === 'unread' ? 'All your notifications are marked read.' : 'You have no recent notifications.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl glass-card flex items-start justify-between cursor-pointer group hover:border-brand-500/50 transition-all ${
                !n.isRead ? 'bg-brand-50/40 dark:bg-brand-950/20 border-l-4 border-l-brand-600' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {n.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import {
  UserCheck,
  UserPlus,
  Clock,
  Check,
  X,
  MessageSquare,
  Trash2,
  Users,
} from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState('connections'); // 'connections' | 'incoming' | 'outgoing'
  const [connections, setConnections] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connRes, reqRes] = await Promise.all([
        apiClient.get('/connections'),
        apiClient.get('/connections/requests'),
      ]);

      if (connRes.data?.success) setConnections(connRes.data.connections || []);
      if (reqRes.data?.success) {
        setIncoming(reqRes.data.incoming || []);
        setOutgoing(reqRes.data.outgoing || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespond = async (connectionId, action) => {
    try {
      const res = await apiClient.put(`/connections/requests/${connectionId}`, { action });
      if (res.data?.success) {
        toast.success(action === 'accept' ? 'Request accepted!' : 'Request declined');
        fetchData();
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleWithdraw = async (connectionId) => {
    try {
      const res = await apiClient.delete(`/connections/requests/${connectionId}`);
      if (res.data?.success) {
        toast.success('Request withdrawn');
        setOutgoing(prev => prev.filter(r => r._id !== connectionId));
      }
    } catch (err) {
      toast.error('Failed to withdraw request');
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    try {
      const res = await apiClient.delete(`/connections/${connectionId}`);
      if (res.data?.success) {
        toast.success('Connection removed');
        setConnections(prev => prev.filter(c => c.connectionId !== connectionId));
      }
    } catch (err) {
      toast.error('Failed to remove connection');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          My Connections & Teammate Requests
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your verified developer network and pending requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-dark-border space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('connections')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'connections'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span>Connected Network ({connections.length})</span>
          {activeTab === 'connections' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 relative transition-colors flex items-center space-x-1.5 ${
            activeTab === 'incoming'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span>Incoming Requests ({incoming.length})</span>
          {incoming.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-brand-500" />
          )}
          {activeTab === 'incoming' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'outgoing'
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span>Sent Requests ({outgoing.length})</span>
          {activeTab === 'outgoing' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
          )}
        </button>
      </div>

      {/* Tab 1: Connected Users */}
      {activeTab === 'connections' && (
        <div>
          {connections.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No connections yet"
              description="Start connecting with innovators from the Discover Teammates page to build your network."
              actionText="Discover Teammates"
              onAction={() => window.location.href = '/discover'}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {connections.map((c) => (
                <div key={c.connectionId} className="p-5 rounded-2xl glass-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={c.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={c.user?.fullName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/20"
                      />
                      <div className="min-w-0">
                        <Link to={`/u/${c.user?.username}`} className="text-sm font-bold text-gray-900 dark:text-white truncate hover:underline block">
                          {c.user?.fullName}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {c.user?.roleTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {c.user?.skills?.slice(0, 3).map((sk, i) => (
                        <span key={i} className="badge-skill text-[10px]">{sk}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                    <Link
                      to="/chat"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Link>
                    <button
                      onClick={() => handleRemoveConnection(c.connectionId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                      title="Remove connection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Incoming Requests */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incoming.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No pending incoming requests"
              description="When other hackers send you a connection request, it will appear here."
            />
          ) : (
            <div className="space-y-3">
              {incoming.map((req) => (
                <div
                  key={req._id}
                  className="p-4 sm:p-5 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={req.requester?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={req.requester?.fullName}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <Link
                        to={`/u/${req.requester?.username}`}
                        className="text-sm font-bold text-gray-900 dark:text-white hover:underline"
                      >
                        {req.requester?.fullName}
                      </Link>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                        {req.requester?.roleTitle} • {req.requester?.college || 'Developer'}
                      </p>
                      {req.message && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 italic mt-1.5 p-2 rounded-lg bg-gray-50 dark:bg-dark-surface">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => handleRespond(req._id, 'reject')}
                      className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleRespond(req._id, 'accept')}
                      className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Outgoing Requests */}
      {activeTab === 'outgoing' && (
        <div className="space-y-4">
          {outgoing.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No pending outgoing requests"
              description="Requests you send to other teammates will be tracked here until they accept."
            />
          ) : (
            <div className="space-y-3">
              {outgoing.map((req) => (
                <div
                  key={req._id}
                  className="p-4 sm:p-5 rounded-2xl glass-card flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={req.recipient?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={req.recipient?.fullName}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <Link
                        to={`/u/${req.recipient?.username}`}
                        className="text-sm font-bold text-gray-900 dark:text-white hover:underline"
                      >
                        {req.recipient?.fullName}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {req.recipient?.roleTitle}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleWithdraw(req._id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Withdraw
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

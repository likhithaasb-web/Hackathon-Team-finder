import React, { useState, useEffect } from 'react';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  Users,
  FolderGit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  Lock,
  Unlock,
  Shield,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import Modal from '../components/Modal.jsx';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'reports' | 'audit'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Users tab state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Report resolution modal state
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes, auditRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/reports'),
        apiClient.get('/admin/audit-logs'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (usersRes.data?.success) setUsers(usersRes.data.users || []);
      if (reportsRes.data?.success) setReports(reportsRes.data.reports || []);
      if (auditRes.data?.success) setAuditLogs(auditRes.data.logs || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative console');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change status of ${user.fullName} to ${nextStatus.toUpperCase()}?`)) {
      return;
    }

    try {
      const res = await apiClient.put(`/admin/users/${user._id}/status`, { status: nextStatus });
      if (res.data?.success) {
        toast.success(res.data.message);
        setUsers(prev => prev.map(u => (u._id === user._id ? { ...u, status: nextStatus } : u)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleToggleUserRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.fullName}'s platform role to ${nextRole.toUpperCase()}?`)) {
      return;
    }

    try {
      const res = await apiClient.put(`/admin/users/${user._id}/status`, { role: nextRole });
      if (res.data?.success) {
        toast.success(res.data.message);
        setUsers(prev => prev.map(u => (u._id === user._id ? { ...u, role: nextRole } : u)));
      }
    } catch (err) {
      toast.error('Role update failed');
    }
  };

  const handleResolveReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await apiClient.put(`/admin/reports/${selectedReport._id}/resolve`, {
        status: resolutionStatus,
        resolutionNotes,
      });

      if (res.data?.success) {
        toast.success('Report resolved');
        setReports(prev =>
          prev.map(r => (r._id === selectedReport._id ? { ...r, status: resolutionStatus, resolutionNotes } : r))
        );
        setSelectedReport(null);
      }
    } catch (err) {
      toast.error('Failed to update report');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 text-white shadow-royal border border-brand-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md mb-2 border border-white/10">
            <ShieldAlert className="w-3.5 h-3.5 text-beige-300" />
            <span className="text-beige-200">Master Moderation & Control Plane</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Center
          </h1>
          <p className="text-xs text-brand-200 mt-1">
            Real-time platform metrics, user moderation, report resolutions, and security audit logs.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/10">
          Status: <span className="text-emerald-400 font-bold">Secure Verified Admin</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-gray-200 dark:border-dark-border space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'overview' ? 'text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span>Platform Overview</span>
          {activeTab === 'overview' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-700" />}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'users' ? 'text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span>User Accounts ({users.length})</span>
          {activeTab === 'users' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-700" />}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 relative transition-colors flex items-center space-x-1.5 ${
            activeTab === 'reports' ? 'text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span>Flagged Reports ({reports.filter(r => r.status === 'pending').length} Pending)</span>
          {reports.some(r => r.status === 'pending') && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}
          {activeTab === 'reports' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-700" />}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'audit' ? 'text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span>Audit Logs ({auditLogs.length})</span>
          {activeTab === 'audit' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-700" />}
        </button>
      </div>

      {/* Tab 1: Overview & Metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl glass-card">
              <span className="text-gray-500 text-[11px] block font-semibold">Total Users</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">
                {stats?.totalUsers || users.length}
              </span>
            </div>
            <div className="p-4 rounded-2xl glass-card">
              <span className="text-gray-500 text-[11px] block font-semibold">Active Online</span>
              <span className="text-2xl font-black text-emerald-500 mt-1 block">
                {stats?.activeUsers || 1}
              </span>
            </div>
            <div className="p-4 rounded-2xl glass-card">
              <span className="text-gray-500 text-[11px] block font-semibold">Total Teams</span>
              <span className="text-2xl font-black text-brand-600 mt-1 block">
                {stats?.totalTeams || 3}
              </span>
            </div>
            <div className="p-4 rounded-2xl glass-card">
              <span className="text-gray-500 text-[11px] block font-semibold">Open Positions</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block">
                {stats?.openPositionsCount || 5}
              </span>
            </div>
            <div className="p-4 rounded-2xl glass-card">
              <span className="text-gray-500 text-[11px] block font-semibold">Hackathons</span>
              <span className="text-2xl font-black text-amber-500 mt-1 block">
                {stats?.totalHackathons || 4}
              </span>
            </div>
            <div className="p-4 rounded-2xl glass-card">
              <span className="text-gray-500 text-[11px] block font-semibold">Pending Reports</span>
              <span className="text-2xl font-black text-red-500 mt-1 block">
                {stats?.pendingReports || reports.filter(r => r.status === 'pending').length}
              </span>
            </div>
          </div>

          {/* Recharts Trends */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Platform Member Growth Trend (New Registrations)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.userTrends?.length ? stats.userTrends : [
                  { date: 'Oct 14', users: 3 },
                  { date: 'Oct 15', users: 5 },
                  { date: 'Oct 16', users: 7 },
                  { date: 'Oct 17', users: 4 },
                  { date: 'Oct 18', users: 9 },
                  { date: 'Oct 19', users: 12 },
                  { date: 'Oct 20', users: 15 },
                ]}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="users" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Accounts Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name, email, or username..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs"
            >
              <option value="all">All Roles</option>
              <option value="user">Normal Users</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl glass-card overflow-x-auto border border-gray-200 dark:border-dark-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-dark-surface/80 border-b border-gray-200 dark:border-dark-border text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">University</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors">
                    <td className="p-3.5 flex items-center space-x-3">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                        alt={u.fullName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{u.fullName}</p>
                        <p className="text-[11px] text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-beige-100 text-brand-900 dark:bg-brand-950 dark:text-brand-300 border border-beige-300 dark:border-brand-800'
                            : 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-gray-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500 truncate max-w-[150px]">
                      {u.college || 'N/A'}
                    </td>
                    <td className="p-3.5 space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className="px-2.5 py-1 rounded text-[10px] font-semibold border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="px-2.5 py-1 rounded text-[10px] font-semibold text-brand-700 bg-beige-100 dark:bg-brand-950/40 hover:bg-beige-200"
                      >
                        {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Flagged Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No reports filed. Platform is healthy!
            </div>
          ) : (
            reports.map((r) => (
              <div
                key={r._id}
                className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Target: {r.targetType.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-red-500 font-semibold">Reason: {r.reason}</p>
                  {r.details && <p className="text-xs text-gray-500 mt-1">"{r.details}"</p>}
                  <p className="text-[10px] text-gray-400 mt-1">
                    Reported by: {r.reporter?.fullName} ({r.reporter?.email})
                  </p>
                </div>

                {r.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedReport(r);
                      setResolutionNotes('');
                    }}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-royal transition-all"
                  >
                    Review & Resolve
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl glass-card overflow-x-auto border border-gray-200 dark:border-dark-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-dark-surface/80 border-b border-gray-200 dark:border-dark-border text-gray-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Admin</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {auditLogs.map((log) => (
                <tr key={log._id}>
                  <td className="p-3.5 text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                    {log.admin?.fullName || 'System'}
                  </td>
                  <td className="p-3.5 text-brand-600 dark:text-brand-400 font-semibold">
                    {log.action}
                  </td>
                  <td className="p-3.5 text-gray-500">
                    {log.targetType}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-400">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolve Report Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title="Resolve Report"
        >
          <form onSubmit={handleResolveReport} className="space-y-4">
            <p className="text-xs text-gray-500">
              Reason: <strong>{selectedReport.reason}</strong>
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Resolution Verdict
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-xs"
              >
                <option value="resolved">Action Taken / Resolved</option>
                <option value="dismissed">Dismiss (No Violation)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Details of investigation and action taken..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-xl text-xs resize-none"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-xl shadow-royal transition-all"
              >
                Save Resolution
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

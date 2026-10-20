import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import {
  Settings,
  Bell,
  Eye,
  Lock,
  Trash2,
  Shield,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();

  const [notificationPreferences, setNotificationPreferences] = useState({
    email: user?.notificationPreferences?.email !== undefined ? user.notificationPreferences.email : true,
    inApp: user?.notificationPreferences?.inApp !== undefined ? user.notificationPreferences.inApp : true,
    teamInvites: user?.notificationPreferences?.teamInvites !== undefined ? user.notificationPreferences.teamInvites : true,
    chat: user?.notificationPreferences?.chat !== undefined ? user.notificationPreferences.chat : true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.privacy?.profileVisibility || 'public',
    showOnlineStatus: user?.privacy?.showOnlineStatus !== undefined ? user.privacy.showOnlineStatus : true,
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    const res = await updateProfile({
      notificationPreferences,
      privacy,
    });
    if (res?.success) {
      toast.success('Preferences saved!');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setChangingPass(true);
    try {
      const res = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data?.success) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to delete your account? All your teams, messages, and connections will be permanently wiped. Type "DELETE" to confirm:'
    );

    if (confirmation === 'DELETE') {
      try {
        const res = await apiClient.delete('/users/me');
        if (res.data?.success) {
          toast.success('Account permanently deleted.');
          logout();
        }
      } catch (err) {
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
          <span>Account Settings</span>
          <Settings className="w-6 h-6 text-brand-500" />
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage privacy, notification alerts, security, and credentials.
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Privacy & Visibility */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-dark-border">
            <Eye className="w-4 h-4 text-brand-500" />
            <span>Privacy & Presence</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Profile Visibility
                </p>
                <p className="text-[11px] text-gray-500">
                  Who can view your profile details and hackathon history.
                </p>
              </div>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                className="px-3 py-1.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-xs"
              >
                <option value="public">Public (Everyone)</option>
                <option value="connections_only">Connections Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-border">
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Show Online Status
                </p>
                <p className="text-[11px] text-gray-500">
                  Allow peers to see when you are actively online.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.showOnlineStatus}
                onChange={(e) => setPrivacy(prev => ({ ...prev, showOnlineStatus: e.target.checked }))}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-dark-border">
            <Bell className="w-4 h-4 text-brand-500" />
            <span>Notification Preferences</span>
          </h3>

          <div className="space-y-3">
            {[
              { key: 'teamInvites', label: 'Team Invitations & Placement Updates', desc: 'When you are invited or accepted into a team' },
              { key: 'chat', label: 'Direct Messages & Mentions', desc: 'Real-time notifications when teammates message you' },
              { key: 'email', label: 'Email Digest Notifications', desc: 'Receive important updates via configured email' },
              { key: 'inApp', label: 'In-App Toast Alerts', desc: 'Real-time popups while using the application' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {item.desc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences[item.key]}
                  onChange={(e) => setNotificationPreferences(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </form>

      {/* Security: Change Password */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-dark-border">
          <Lock className="w-4 h-4 text-brand-500" />
          <span>Security & Password</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50"
          >
            {changingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20 space-y-3">
        <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center space-x-2">
          <Trash2 className="w-4 h-4" />
          <span>Danger Zone: Permanent Account Deletion</span>
        </h3>
        <p className="text-xs text-gray-500">
          Once you delete your account, your profile, team memberships, messages, and bookmarks will be irrevocably deleted from our database.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

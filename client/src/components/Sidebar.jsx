import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Calendar,
  MessageSquare,
  UserCheck,
  Bookmark,
  Settings,
  HelpCircle,
  FolderGit2,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Teammates', path: '/discover', icon: Users },
    { name: 'My Teams', path: '/teams/my-teams', icon: FolderGit2 },
    { name: 'Hackathons', path: '/hackathons', icon: Calendar },
    { name: 'Real-time Chat', path: '/chat', icon: MessageSquare },
    { name: 'Connections & Requests', path: '/connections', icon: UserCheck },
    { name: 'Saved Bookmarks', path: '/bookmarks', icon: Bookmark },
  ];

  const adminLink = { name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert };
  const bottomLinks = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Guidelines', path: '/help', icon: HelpCircle },
  ];

  const navClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 font-semibold shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-card/60'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col justify-between p-4 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Navigation Links */}
        <div className="space-y-6">
          <div className="flex items-center justify-between lg:hidden px-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Navigation</span>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={navClass}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}

            {user?.role === 'admin' && (
              <NavLink
                to={adminLink.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold'
                      : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{adminLink.name}</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-1 pt-4 border-t border-gray-100 dark:border-dark-border">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={navClass}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 px-3 flex items-center space-x-2 text-[11px] text-gray-400 dark:text-gray-500">
            <span>HackMate v1.0.0</span>
            <span>•</span>
            <span className="text-emerald-500 font-medium">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}

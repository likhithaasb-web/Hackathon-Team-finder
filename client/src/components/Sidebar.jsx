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
        ? 'bg-brand-700 text-white dark:bg-brand-600 dark:text-white font-semibold shadow-royal'
        : 'text-beige-800 dark:text-dark-beigeMuted hover:text-brand-700 dark:hover:text-white hover:bg-beige-100/80 dark:hover:bg-dark-card'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-r border-beige-200/90 dark:border-dark-border flex flex-col justify-between p-4 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Navigation Links */}
        <div className="space-y-6">
          <div className="flex items-center justify-between lg:hidden px-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-beige-600 dark:text-dark-beigeMuted">Navigation</span>
            <button onClick={onClose} className="p-1 rounded-lg text-beige-500 hover:text-beige-800 dark:hover:text-white">
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
                      ? 'bg-amber-600 text-white font-semibold shadow-sm'
                      : 'text-amber-800 dark:text-amber-300 hover:bg-beige-100 dark:hover:bg-dark-card'
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
        <div className="space-y-2 pt-4 border-t border-beige-200/80 dark:border-dark-border">
          {/* User Mini Card */}
          {user && (
            <div className="p-2.5 rounded-xl bg-beige-100/70 dark:bg-dark-card border border-beige-200 dark:border-dark-border flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {user.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-dark-beige truncate">{user.fullName}</p>
                <p className="text-[10px] text-beige-700 dark:text-beige-400 truncate font-medium">{user.primaryRole || 'Developer'}</p>
              </div>
            </div>
          )}

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

          <div className="pt-2 px-3 flex items-center justify-between text-[11px] text-beige-600 dark:text-gray-500 font-medium">
            <span>HackMate v1.0.0</span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

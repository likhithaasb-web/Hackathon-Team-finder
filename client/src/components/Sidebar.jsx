import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
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
  Bell,
  X,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount, notifications } = useSocket();

  if (!isAuthenticated) return null;

  const unreadNotifsCount = notifications?.filter(n => !n.isRead)?.length || 0;

  const sections = [
    {
      title: 'PLATFORM',
      links: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
          name: 'Notifications',
          path: '/notifications',
          icon: Bell,
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
          badgeColor: 'bg-brand-600',
        },
      ],
    },
    {
      title: 'TEAMING & COLLABORATION',
      links: [
        { name: 'Find Teammates', path: '/discover', icon: Users },
        { name: 'My Teams', path: '/teams/my-teams', icon: FolderGit2 },
        {
          name: 'Real-time Chat',
          path: '/chat',
          icon: MessageSquare,
          badge: unreadCount > 0 ? unreadCount : null,
          badgeColor: 'bg-emerald-600',
        },
        { name: 'Connections', path: '/connections', icon: UserCheck },
      ],
    },
    {
      title: 'DISCOVER & SAVE',
      links: [
        { name: 'Hackathons', path: '/hackathons', icon: Calendar },
        { name: 'Saved Bookmarks', path: '/bookmarks', icon: Bookmark },
      ],
    },
  ];

  const adminLink = { name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert };
  const bottomLinks = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Guidelines', path: '/help', icon: HelpCircle },
  ];

  const navClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-brand-700 text-white dark:bg-brand-600 dark:text-white shadow-royal'
        : 'text-gray-700 dark:text-gray-300 hover:text-brand-700 dark:hover:text-white hover:bg-beige-100/90 dark:hover:bg-dark-card/80'
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
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-r border-beige-200/90 dark:border-dark-border flex flex-col justify-between p-3.5 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Navigation Links */}
        <div className="space-y-5 overflow-y-auto pr-1">
          <div className="flex items-center justify-between lg:hidden px-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Navigation</span>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <h5 className="px-3 text-[10px] font-extrabold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                {sec.title}
              </h5>
              {sec.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={navClass}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${link.badgeColor}`}>
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}

          {user?.role === 'admin' && (
            <div className="space-y-1 pt-1">
              <h5 className="px-3 text-[10px] font-extrabold tracking-wider uppercase text-amber-500 mb-1.5">
                MODERATION
              </h5>
              <NavLink
                to={adminLink.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-dark-card'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{adminLink.name}</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="space-y-2 pt-3 border-t border-beige-200/90 dark:border-dark-border shrink-0">
          {/* User Mini Card with Status */}
          {user && (
            <div className="p-2.5 rounded-xl bg-beige-50 dark:bg-dark-card border border-beige-200 dark:border-dark-border flex items-center space-x-3 mb-1">
              <div className="relative shrink-0">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-brand-600/30"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-dark-card" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                <p className="text-[10px] text-brand-600 dark:text-brand-400 truncate font-semibold">
                  {user.roleTitle || 'Innovator'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            {bottomLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={navClass}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>

          <div className="pt-2 px-2 flex items-center justify-between text-[10px] text-gray-400 font-medium">
            <span>HackMate v1.2</span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Live Connected</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

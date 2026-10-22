import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Users,
  Compass,
  Trophy,
  LogOut,
  User,
  Settings,
  Shield,
  Bookmark,
  Check,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, notifications, markAllNotificationsRead, markNotificationRead } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif._id);
    setShowNotifications(false);
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-beige-200/90 dark:border-dark-border/90 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-beige-700 hover:text-brand-700 dark:text-beige-300 dark:hover:text-white hover:bg-beige-100 dark:hover:bg-dark-card transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-blue-600 flex items-center justify-center text-white shadow-royal group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Hack<span className="text-brand-600 dark:text-brand-400">Mate</span>
              </span>
            </Link>

            {/* Quick Links on Desktop */}
            <nav className="hidden md:flex items-center space-x-1 ml-6">
              <Link
                to="/discover"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-beige-900 dark:text-dark-beige hover:text-brand-700 dark:hover:text-brand-400 hover:bg-beige-100/80 dark:hover:bg-dark-card transition-colors"
              >
                Find Teammates
              </Link>
              <Link
                to="/teams"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-beige-900 dark:text-dark-beige hover:text-brand-700 dark:hover:text-brand-400 hover:bg-beige-100/80 dark:hover:bg-dark-card transition-colors"
              >
                Teams
              </Link>
              <Link
                to="/hackathons"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-beige-900 dark:text-dark-beige hover:text-brand-700 dark:hover:text-brand-400 hover:bg-beige-100/80 dark:hover:bg-dark-card transition-colors"
              >
                Hackathons
              </Link>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, teammates, hackathons..."
                className="w-full pl-10 pr-4 py-2 bg-beige-100/70 dark:bg-dark-card border border-beige-200/90 dark:border-dark-border focus:border-brand-600 dark:focus:border-brand-500 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-beige-500/80 focus:outline-none transition-all"
              />
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-beige-700 hover:text-brand-700 dark:text-dark-beigeMuted dark:hover:text-white hover:bg-beige-100 dark:hover:bg-dark-card transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-brand-700" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Create Team Quick Action */}
                <Link
                  to="/teams/create"
                  className="hidden md:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-beige-100 text-brand-800 dark:bg-dark-card dark:text-brand-300 hover:bg-beige-200 dark:hover:bg-brand-950/80 text-xs font-semibold border border-beige-300/80 dark:border-dark-border transition-colors shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Create Team</span>
                </Link>

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl text-beige-700 hover:text-brand-700 dark:text-dark-beigeMuted dark:hover:text-white hover:bg-beige-100 dark:hover:bg-dark-card transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white ring-2 ring-white dark:ring-dark-surface animate-pulse shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-surface border border-beige-200 dark:border-dark-border rounded-2xl shadow-xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-beige-100 dark:border-dark-border bg-beige-50/80 dark:bg-dark-card/50">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
                            No notifications yet!
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-start space-x-3 ${
                                !notif.isRead ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-100 dark:border-dark-border text-center bg-gray-50/50 dark:bg-dark-card/50">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
                  >
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30"
                    />
                    <span className="hidden md:inline-block text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[100px] truncate">
                      {user.fullName.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-surface border border-beige-200 dark:border-dark-border rounded-2xl shadow-xl overflow-hidden z-50">
                      <div className="p-4 border-b border-beige-100 dark:border-dark-border bg-beige-50/80 dark:bg-dark-card/50">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          @{user.username}
                        </p>
                        {/* Profile completion mini bar */}
                        <div className="mt-2.5">
                          <div className="flex justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                            <span>Profile Completeness</span>
                            <span className="font-semibold text-brand-600 dark:text-brand-400">
                              {user.profileCompleteness || 60}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-dark-border h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-500 h-1.5 rounded-full"
                              style={{ width: `${user.profileCompleteness || 60}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card"
                        >
                          <Compass className="w-4 h-4 text-gray-400" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/bookmarks"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card"
                        >
                          <Bookmark className="w-4 h-4 text-gray-400" />
                          <span>Saved Items</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span>Account Settings</span>
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-brand-700 dark:text-brand-300 hover:bg-beige-100 dark:hover:bg-brand-950/40"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Admin Center</span>
                          </Link>
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-100 dark:border-dark-border">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-beige-900 dark:text-dark-beige hover:text-brand-700 dark:hover:text-brand-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-brand-700 hover:bg-brand-800 shadow-royal transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

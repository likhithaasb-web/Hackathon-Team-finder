import React, { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Calendar,
  MessageSquare,
} from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useSocket();
  const location = useLocation();

  const isLanding = location.pathname === '/';
  const isChat = location.pathname.startsWith('/chat');

  const mobileLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Teammates', path: '/discover', icon: Users },
    { name: 'Teams', path: '/teams', icon: FolderGit2 },
    { name: 'Hackathons', path: '/hackathons', icon: Calendar },
    { name: 'Chat', path: '/chat', icon: MessageSquare, badge: unreadCount > 0 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-beige-50 dark:bg-dark-bg text-gray-900 dark:text-dark-beige selection:bg-brand-600 selection:text-white transition-colors">
      {/* Top subtle royal blue accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-700 via-brand-500 to-amber-600 z-50 sticky top-0" />

      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      
      {isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <main className={`flex-1 flex flex-col ${isAuthenticated ? 'lg:pl-64 pb-16 lg:pb-0' : ''}`}>
        {isLanding ? (
          <div className="flex-1 w-full">
            <Outlet />
          </div>
        ) : isChat ? (
          <div className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 flex flex-col">
            <Outlet />
          </div>
        ) : (
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        )}
        <Footer />
      </main>

      {/* Compact Mobile Bottom Navigation */}
      {isAuthenticated && !isLanding && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-lg border-t border-beige-200/90 dark:border-dark-border px-2 py-1.5 flex items-center justify-around shadow-2xl">
          {mobileLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-brand-600 rounded-full" />
                )}
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}

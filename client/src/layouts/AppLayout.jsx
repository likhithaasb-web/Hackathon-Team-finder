import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isLanding = location.pathname === '/';
  const isChat = location.pathname.startsWith('/chat');

  return (
    <div className="min-h-screen flex flex-col bg-beige-50 dark:bg-dark-bg text-gray-900 dark:text-dark-beige selection:bg-brand-600 selection:text-white transition-colors">
      {/* Top subtle royal blue accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-700 via-brand-500 to-amber-600 z-50 sticky top-0" />

      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      
      {isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <main className={`flex-1 flex flex-col ${isAuthenticated ? 'lg:pl-64' : ''}`}>
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
    </div>
  );
}

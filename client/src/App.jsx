import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DiscoverTeammatesPage from './pages/DiscoverTeammatesPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import ConnectionsPage from './pages/ConnectionsPage.jsx';
import HackathonsPage from './pages/HackathonsPage.jsx';
import HackathonDetailPage from './pages/HackathonDetailPage.jsx';
import TeamsPage from './pages/TeamsPage.jsx';
import CreateTeamPage from './pages/CreateTeamPage.jsx';
import TeamDetailPage from './pages/TeamDetailPage.jsx';
import TeamWorkspacePage from './pages/TeamWorkspacePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import BookmarksPage from './pages/BookmarksPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

// Route Guards
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function ProfileRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/u/${user.username}`} replace />;
}

// 404 Not Found Page
function NotFoundPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center text-2xl font-black">
        404
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Page Not Found</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        The page you are looking for doesn't exist or has been moved. Explore hackathons or teammates instead.
      </p>
      <a
        href="/"
        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-glow transition-all"
      >
        Return to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1F2937',
                  color: '#F9FAFB',
                  fontSize: '13px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
              }}
            />
            <Routes>
              <Route path="/" element={<AppLayout />}>
                {/* Public & Landing */}
                <Route index element={<LandingPage />} />
                <Route path="discover" element={<DiscoverTeammatesPage />} />
                <Route path="u/:username" element={<UserProfilePage />} />
                <Route path="hackathons" element={<HackathonsPage />} />
                <Route path="hackathons/:id" element={<HackathonDetailPage />} />
                <Route path="teams" element={<TeamsPage />} />
                <Route path="teams/:id" element={<TeamDetailPage />} />
                <Route path="help" element={<HelpPage />} />

                {/* Auth (Public Only) */}
                <Route
                  path="login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="register"
                  element={
                    <PublicOnlyRoute>
                      <RegisterPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="forgot-password"
                  element={
                    <PublicOnlyRoute>
                      <ForgotPasswordPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="reset-password/:token"
                  element={
                    <PublicOnlyRoute>
                      <ResetPasswordPage />
                    </PublicOnlyRoute>
                  }
                />

                {/* Authenticated Routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <ProfileRedirect />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile/edit"
                  element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="connections"
                  element={
                    <ProtectedRoute>
                      <ConnectionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teams/my-teams"
                  element={
                    <ProtectedRoute>
                      <TeamsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teams/create"
                  element={
                    <ProtectedRoute>
                      <CreateTeamPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teams/:id/workspace"
                  element={
                    <ProtectedRoute>
                      <TeamWorkspacePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="chat"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="chat/:conversationId"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="bookmarks"
                  element={
                    <ProtectedRoute>
                      <BookmarksPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

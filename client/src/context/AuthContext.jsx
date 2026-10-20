import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hackmate_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hackmate_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hackmate_token');
      if (storedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('hackmate_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session verification failed:', err.message);
          localStorage.removeItem('hackmate_token');
          localStorage.removeItem('hackmate_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('hackmate_token', newToken);
        localStorage.setItem('hackmate_user', JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.fullName}!`);
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await apiClient.post('/auth/register', formData);
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('hackmate_token', newToken);
        localStorage.setItem('hackmate_user', JSON.stringify(userData));
        toast.success('Account created successfully! Welcome to HackMate.');
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await apiClient.put('/auth/profile', updates);
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('hackmate_user', JSON.stringify(res.data.user));
        toast.success('Profile updated successfully!');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('hackmate_token');
      localStorage.removeItem('hackmate_user');
      setUser(null);
      setToken(null);
      toast.success('Logged out successfully.');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('hackmate_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

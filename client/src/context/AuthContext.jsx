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
        if (storedToken.startsWith('demo_token_')) {
          setLoading(false);
          return;
        }
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
      return {
        success: false,
        message: msg,
        code: err.response?.data?.code,
        troubleshooting: err.response?.data?.troubleshooting,
      };
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
      return {
        success: false,
        message: msg,
        code: err.response?.data?.code,
        troubleshooting: err.response?.data?.troubleshooting,
      };
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

  const socialLogin = async (provider, profileData = {}) => {
    try {
      const res = await apiClient.post('/auth/social-login', { provider, ...profileData });
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('hackmate_token', newToken);
        localStorage.setItem('hackmate_user', JSON.stringify(userData));
        toast.success(`Welcome to HackMate, ${userData.fullName}!`);
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to sign in with ${provider}.`;
      toast.error(msg);
      return {
        success: false,
        message: msg,
        code: err.response?.data?.code,
        troubleshooting: err.response?.data?.troubleshooting,
      };
    }
  };

  const demoLogin = (profileData = {}) => {
    const dummyUser = {
      _id: `user_${Date.now()}`,
      fullName: profileData.fullName || 'HackMate Explorer',
      username: profileData.username || `builder_${Math.floor(100 + Math.random() * 900)}`,
      email: profileData.email || 'builder@hackmate.dev',
      roleTitle: profileData.roleTitle || 'Full-Stack Developer',
      college: profileData.college || 'Vignan',
      yearOfStudy: profileData.yearOfStudy || '3rd Year',
      location: profileData.location || 'India',
      skills: profileData.skills?.length ? profileData.skills : ['Java', 'Python', 'React', 'Node.js'],
      preferredRoles: profileData.preferredRoles?.length ? profileData.preferredRoles : ['Full-Stack', 'AI/ML Engineer'],
      collaborationMode: profileData.collaborationMode || 'Remote',
      availability: profileData.availability || 'Flexible',
      bio: profileData.bio || 'Passionate builder eager to win hackathons.',
      avatarUrl:
        profileData.avatarUrl ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${profileData.username || 'builder'}`,
      role: 'member',
      isOnline: true,
      createdAt: new Date().toISOString(),
    };
    const mockToken = `demo_token_${Date.now()}`;
    setToken(mockToken);
    setUser(dummyUser);
    localStorage.setItem('hackmate_token', mockToken);
    localStorage.setItem('hackmate_user', JSON.stringify(dummyUser));
    toast.success(`Welcome to HackMate, ${dummyUser.fullName}!`);
    return { success: true, user: dummyUser };
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
        demoLogin,
        socialLogin,
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

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get('/notifications?limit=20');
      if (res.data?.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Connect socket
    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      console.log('[Socket] Connected to real-time engine:', s.id);
    });

    // Real-time notification received
    s.on('notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast(newNotif.title, {
        icon: '🔔',
        duration: 4000,
      });
    });

    // User presence updates
    s.on('user_presence_changed', ({ userId, isOnline }) => {
      setOnlineUserIds(prev => {
        const next = new Set(prev);
        if (isOnline) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    socketRef.current = s;
    setSocket(s);

    fetchNotifications();

    return () => {
      s.disconnect();
    };
  }, [token, user?._id]);

  const markAllNotificationsRead = async () => {
    try {
      await apiClient.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read:', err.message);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err.message);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUserIds,
        notifications,
        unreadCount,
        fetchNotifications,
        markAllNotificationsRead,
        markNotificationRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

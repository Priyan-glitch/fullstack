import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import { notificationApi } from '../config/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, role, isAuthenticated } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  // Derive target user ID for the notification service:
  // Admin uses "admin", students use their numeric/string student ID
  const targetUserId = isAuthenticated
    ? role === 'admin'
      ? 'admin'
      : user?.id
      ? String(user.id)
      : null
    : null;

  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!targetUserId) return;
    if (!isBackground) setLoading(true);

    try {
      const data = await notificationApi.getNotifications(targetUserId);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setLastFetched(new Date());
    } catch (err) {
      // Fail silently on background poll to avoid spamming the console
      if (!isBackground) {
        console.warn('Could not fetch notifications:', err.message);
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [targetUserId]);

  // Initial fetch and polling loop
  useEffect(() => {
    if (!targetUserId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Immediate fetch on user switch
    fetchNotifications(false);

    // Poll every 6 seconds for fresh real-time notification alerts
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [targetUserId, fetchNotifications]);

  const markAsRead = async (id) => {
    if (!targetUserId) return;
    try {
      await notificationApi.markRead(id, targetUserId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!targetUserId) return;
    try {
      await notificationApi.markAllRead(targetUserId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => {
        const item = prev.find((n) => n.id === id);
        if (item && !item.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    lastFetched,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

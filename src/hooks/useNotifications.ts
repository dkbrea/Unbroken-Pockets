'use client';

import { useState, useCallback, useEffect } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationSource = 'system' | 'transaction' | 'budget' | 'goal' | 'account' | 'bill';

export type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  source: NotificationSource;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
};

export type NotificationsState = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
};

export function useNotifications(): NotificationsState {
  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif_1',
      title: 'Low Balance Alert',
      message: 'Your checking account balance is below $500',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      type: 'warning',
      source: 'account',
      isRead: false,
      actionUrl: '/accounts',
      actionLabel: 'View Account',
    },
    {
      id: 'notif_2',
      title: 'Bill Due Soon',
      message: 'Your electricity bill of $95.67 is due in 3 days',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      type: 'info',
      source: 'bill',
      isRead: false,
      actionUrl: '/bills',
      actionLabel: 'Pay Now',
    },
    {
      id: 'notif_3',
      title: 'Budget Alert',
      message: 'You\'ve reached 90% of your Entertainment budget this month',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      type: 'warning',
      source: 'budget',
      isRead: true,
      actionUrl: '/budget',
      actionLabel: 'View Budget',
    },
    {
      id: 'notif_4',
      title: 'Goal Achievement',
      message: 'Congratulations! You\'ve reached 50% of your Emergency Fund goal',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      type: 'success',
      source: 'goal',
      isRead: true,
      actionUrl: '/goals',
      actionLabel: 'View Goal',
    },
    {
      id: 'notif_5',
      title: 'New Feature Available',
      message: 'Try our new budget insights feature to optimize your spending',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      type: 'info',
      source: 'system',
      isRead: true,
      actionUrl: '/budget/insights',
      actionLabel: 'Try It',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Fetch notifications
  const fetchNotifications = useCallback(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock implementation - no actual fetching in this demo
      setIsLoading(false);
    }, 500);
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
  }, []);

  // Delete a notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
} 
'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'price_alert' | 'portfolio_update' | 'news' | 'system';
  priority: 'low' | 'normal' | 'high';
  read: boolean;
  sentAt: string;
  data?: Record<string, unknown>;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') {
        params.set('unreadOnly', 'true');
      }
      params.set('limit', '50');

      const response = await fetch(`/api/notifications/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[], read: boolean) => {
    try {
      const response = await fetch('/api/notifications/history', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          read,
        }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            notificationIds.includes(n.id) ? { ...n, read } : n
          )
        );
        setUnreadCount(prev => read ? prev - notificationIds.length : prev + notificationIds.length);
        toast.success(read ? 'Marked as read' : 'Marked as unread');
      }
    } catch (error) {
      console.error('Failed to update notifications:', error);
      toast.error('Failed to update notifications');
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds, true);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'price_alert':
        return 'text-green-600 bg-green-100';
      case 'portfolio_update':
        return 'text-blue-600 bg-blue-100';
      case 'news':
        return 'text-purple-600 bg-purple-100';
      case 'system':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'normal':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🟡';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-700 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex border-b">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              filter === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              filter === 'unread'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-2 border-b">
            <button
              onClick={markAllAsRead}
              className="w-full text-left text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">We&apos;ll notify you about important updates</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead([notification.id], !notification.read)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs">{getPriorityIcon(notification.priority)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.sentAt)}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead([notification.id], !notification.read);
                        }}
                        className={`p-1 rounded ${
                          notification.read
                            ? 'text-gray-400 hover:text-gray-600'
                            : 'text-blue-500 hover:text-blue-700'
                        }`}
                      >
                        {notification.read ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
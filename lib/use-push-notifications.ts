import { useState, useEffect } from 'react';
import { pushNotificationService, PushNotificationData } from './push-notifications';
import { toast } from 'react-hot-toast';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported(pushNotificationService.isSupported());

    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Listen for push notification events
    const handlePushNotification = (event: CustomEvent<PushNotificationData>) => {
      const notification = event.detail;

      // Show toast notification
      toast(`${notification.title}: ${notification.body}`, {
        duration: notification.priority === 'high' ? 10000 : 5000,
      });
    };

    window.addEventListener('pushNotification', handlePushNotification as EventListener);

    return () => {
      window.removeEventListener('pushNotification', handlePushNotification as EventListener);
    };
  }, []);

  const initialize = async () => {
    try {
      await pushNotificationService.initialize();
      setIsInitialized(true);

      const token = pushNotificationService.getCurrentToken();
      setCurrentToken(token);

      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      toast.success('Push notifications enabled');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      toast.error('Failed to enable push notifications');
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await initialize();
        return true;
      } else {
        toast.error('Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  };

  const unregister = async () => {
    try {
      await pushNotificationService.unregister();
      setIsInitialized(false);
      setCurrentToken(null);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Failed to unregister push notifications:', error);
      toast.error('Failed to disable push notifications');
    }
  };

  return {
    isSupported,
    isInitialized,
    permission,
    currentToken,
    initialize,
    requestPermission,
    unregister,
  };
}
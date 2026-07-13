import { PushNotifications, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import type { MessagePayload } from 'firebase/messaging';
import { messaging, requestNotificationPermission, onMessageListener } from './firebase';

export interface PushNotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  type: 'price_alert' | 'portfolio_update' | 'news' | 'system';
  priority: 'low' | 'normal' | 'high';
}

type IncomingNotification = MessagePayload | PushNotificationSchema;

export interface NotificationToken {
  token: string;
  platform: 'web' | 'ios' | 'android';
  userId: string;
}

class PushNotificationService {
  private isInitialized = false;
  private currentToken: string | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  private async initializeWeb(): Promise<void> {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);

        // Request permission and get token
        const token = await requestNotificationPermission();
        if (token) {
          this.currentToken = token;
          await this.registerToken(token, 'web');
        }
      }

      // Listen for foreground messages
      onMessageListener().then((payload: MessagePayload) => {
        console.log('Foreground message received:', payload);
        this.handleNotification(payload);
      });
    } catch (error) {
      console.error('Web push notification initialization failed:', error);
    }
  }

  private async initializeNative(): Promise<void> {
    try {
      // Request permissions
      const permissionResult = await PushNotifications.requestPermissions();
      if (permissionResult.receive === 'granted') {
        await PushNotifications.register();
      }

      // Add listeners
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token:', token.value);
        this.currentToken = token.value;
        this.registerToken(token.value, Capacitor.getPlatform() as 'ios' | 'android');
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration failed:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        this.handleNotification(notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push notification action performed:', action);
        this.handleNotificationAction(action);
      });
    } catch (error) {
      console.error('Native push notification initialization failed:', error);
    }
  }

  private async registerToken(token: string, platform: 'web' | 'ios' | 'android'): Promise<void> {
    try {
      const response = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register token');
      }

      console.log('Token registered successfully');
    } catch (error) {
      console.error('Token registration failed:', error);
    }
  }

  private handleNotification(notification: IncomingNotification): void {
    // Create a toast notification or update UI
    const data = notification.data as Record<string, string> | undefined;
    const title = 'title' in notification ? notification.title : undefined;
    const body = 'body' in notification ? notification.body : undefined;
    const notificationData: PushNotificationData = {
      id: data?.id || Date.now().toString(),
      title: title || notification.notification?.title || 'Unity Oracle Alert',
      body: body || notification.notification?.body || 'New update available',
      data,
      type: (data?.type as PushNotificationData['type']) || 'system',
      priority: (data?.priority as PushNotificationData['priority']) || 'normal',
    };

    // Emit custom event for UI components to listen
    window.dispatchEvent(new CustomEvent('pushNotification', { detail: notificationData }));

    // Show browser notification if not already shown by service worker
    if (!Capacitor.isNativePlatform() && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationData.title, {
        body: notificationData.body,
        icon: '/icon-192x192.png',
        tag: `unity-oracle-${notificationData.id}`,
      });
    }
  }

  private handleNotificationAction(action: ActionPerformed): void {
    const { actionId, notification } = action;
    const data = notification.data as Record<string, string> | undefined;

    switch (actionId) {
      case 'view':
        // Navigate to relevant page
        if (data?.url) {
          window.location.href = data.url;
        } else {
          window.location.href = '/tools/oracle-alerts';
        }
        break;
      case 'dismiss':
        // Just dismiss
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  }

  async unregister(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await PushNotifications.unregister();
      } else {
        // Unregister service worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            if (registration.scope.includes('firebase-messaging-sw.js')) {
              await registration.unregister();
            }
          }
        }
      }

      // Unregister token from server
      if (this.currentToken) {
        await fetch('/api/notifications/unregister-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: this.currentToken,
          }),
        });
      }

      this.isInitialized = false;
      this.currentToken = null;
    } catch (error) {
      console.error('Failed to unregister push notifications:', error);
    }
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }

  isSupported(): boolean {
    return Capacitor.isNativePlatform() ||
           ('serviceWorker' in navigator && 'PushManager' in window);
  }
}

export const pushNotificationService = new PushNotificationService();
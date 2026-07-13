'use client';

import { useState, useEffect } from 'react';
import { useUserPreferences } from '@/lib/user-preferences-context';
import { showSuccess, showError } from '@/lib/toast';

interface NotificationSettingsModalProps {
  show: boolean;
  onHide: () => void;
}

interface NotificationSettings {
  // Market & Portfolio
  priceAlerts: boolean;
  portfolioUpdates: boolean;
  liquidationAlerts: boolean;
  fundingRateAlerts: boolean;

  // Analyst & Content
  analystInsights: boolean;
  newsAlerts: boolean;
  airdropAlerts: boolean;

  // System & Security
  systemUpdates: boolean;
  securityAlerts: boolean;
  loginNotifications: boolean;

  // Delivery Methods
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;

  // Frequency & Timing
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export default function NotificationSettingsModal({ show, onHide }: NotificationSettingsModalProps) {
  const { preferences, updateNotificationSettings } = useUserPreferences();
  const [settings, setSettings] = useState<NotificationSettings>({
    priceAlerts: false,
    portfolioUpdates: false,
    liquidationAlerts: false,
    fundingRateAlerts: false,
    analystInsights: false,
    newsAlerts: false,
    airdropAlerts: false,
    systemUpdates: false,
    securityAlerts: false,
    loginNotifications: false,
    pushEnabled: false,
    emailEnabled: false,
    smsEnabled: false,
    notificationFrequency: 'immediate',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load notification settings when modal opens
  useEffect(() => {
    if (show) {
      loadNotificationSettings();
    }
  }, [show]);

  const loadNotificationSettings = async () => {
    try {
      // INSERTAPIHERE: Fetch comprehensive notification settings
      const response = await fetch('/api/notifications/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else if (preferences?.notificationSettings) {
        // Fallback to basic preferences
        setSettings(prev => ({
          ...prev,
          priceAlerts: preferences.notificationSettings.priceAlerts || false,
          analystInsights: preferences.notificationSettings.analystInsights || false,
          pushEnabled: preferences.notificationSettings.pushEnabled || false,
        }));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const handleSettingChange = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Auto-save individual setting
    updateNotificationSetting(key, value);
  };

  const updateNotificationSetting = async <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    try {
      // INSERTAPIHERE: Update individual notification setting
      const response = await fetch('/api/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        console.error('Failed to update notification setting');
      }
    } catch (error) {
      console.error('Network error updating notification setting');
    }
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    try {
      // INSERTAPIHERE: Save all notification settings
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        showSuccess('Notification settings saved successfully');
        onHide();
      } else {
        showError('Failed to save notification settings');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async (type: string) => {
    try {
      // INSERTAPIHERE: Send test notification
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        showSuccess('Test notification sent!');
      } else {
        showError('Failed to send test notification');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    }
  };

  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex={-1} style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-bell me-2"></i>
              Notification Preferences
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <p className="text-secondary mb-4">
              Configure how you want to be notified about market changes and analyst insights.
            </p>

            <div className="mb-4">
              <h6 className="mb-3">Market Notifications</h6>
               <div className="form-check form-switch mb-3">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   id="priceAlerts"
                   checked={settings.priceAlerts}
                   onChange={(e) => handleSettingChange('priceAlerts', e.target.checked)}
                 />
                <label className="form-check-label" htmlFor="priceAlerts">
                  <strong>Price Alerts</strong>
                  <br />
                  <small className="text-secondary">Get notified when your portfolio assets reach price targets</small>
                </label>
              </div>

               <div className="form-check form-switch mb-3">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   id="analystInsights"
                   checked={settings.analystInsights}
                   onChange={(e) => handleSettingChange('analystInsights', e.target.checked)}
                 />
                <label className="form-check-label" htmlFor="analystInsights">
                  <strong>Analyst Insights</strong>
                  <br />
                  <small className="text-secondary">Receive notifications for new analysis from followed analysts</small>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="mb-3">Delivery Methods</h6>
              <div className="form-check form-switch mb-3">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   id="pushEnabled"
                   checked={settings.pushEnabled}
                   onChange={(e) => handleSettingChange('pushEnabled', e.target.checked)}
                 />
                <label className="form-check-label" htmlFor="pushEnabled">
                  <strong>Push Notifications</strong>
                  <br />
                  <small className="text-secondary">Enable browser push notifications for real-time alerts</small>
                </label>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailNotifications"
                  defaultChecked={false}
                  disabled
                />
                <label className="form-check-label" htmlFor="emailNotifications">
                  <strong>Email Notifications</strong>
                  <br />
                  <small className="text-secondary">Receive notifications via email (coming soon)</small>
                </label>
              </div>
            </div>

            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Note:</strong> Changes are saved automatically as you make them.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveAll} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Done
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
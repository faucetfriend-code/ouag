'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useUserPreferences } from '@/lib/user-preferences-context';

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const { preferences, updateNotificationSettings } = useUserPreferences();
  const [localSettings, setLocalSettings] = useState({
    priceAlerts: false,
    analystInsights: false,
    pushEnabled: false,
    emailEnabled: false,
    smsEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync local state with preferences when component mounts or preferences change
  useEffect(() => {
    if (!user || !preferences?.notificationSettings) return; // Skip if no user or preferences

    setLocalSettings({
      priceAlerts: preferences.notificationSettings.priceAlerts || false,
      analystInsights: preferences.notificationSettings.analystInsights || false,
      pushEnabled: preferences.notificationSettings.pushEnabled || false,
      emailEnabled: preferences.notificationSettings.emailEnabled || false,
      smsEnabled: preferences.notificationSettings.smsEnabled || false,
    });
  }, [user, preferences]);

  const handleSettingChange = (setting: keyof typeof localSettings) => {
    const newSettings = {
      ...localSettings,
      [setting]: !localSettings[setting]
    };
    setLocalSettings(newSettings);

    // Auto-save to preferences
    updateNotificationSettings({ [setting]: newSettings[setting] });
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    try {
      await updateNotificationSettings(localSettings);
      // Show success message
      alert('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async (type: 'push' | 'email') => {
    setIsLoading(true);
    try {
      // TODO: Implement test notification API call
      console.log(`Sending test ${type} notification...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Test ${type} notification sent!`);
    } catch (error) {
      alert(`Error sending test ${type} notification`);
    } finally {
      setIsLoading(false);
    }
  };

  // Early return after all hooks
  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h1 className="mb-3">Notification Settings</h1>
          <p className="text-secondary mb-4">Please log in to access your notification settings.</p>
          <Link href="/login" className="btn btn-primary">
            <i className="bi bi-discord me-2"></i>
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/settings" className="text-decoration-none">Settings</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Notifications
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Notification Preferences</h1>
        <p className="text-secondary mb-0">Configure how and when you want to be notified about market changes and analyst insights</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Market Notifications */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Market Notifications
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Get notified about important market events and price movements.
              </p>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="priceAlerts"
                    checked={localSettings.priceAlerts}
                    onChange={() => handleSettingChange('priceAlerts')}
                  />
                  <label className="form-check-label" htmlFor="priceAlerts">
                    <strong>Price Alerts</strong>
                    <br />
                    <small className="text-secondary">Get notified when your portfolio assets reach price targets or show significant movement</small>
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="analystInsights"
                    checked={localSettings.analystInsights}
                    onChange={() => handleSettingChange('analystInsights')}
                  />
                  <label className="form-check-label" htmlFor="analystInsights">
                    <strong>Analyst Insights</strong>
                    <br />
                    <small className="text-secondary">Receive notifications for new analysis and trading signals from followed analysts</small>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Methods */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-send me-2"></i>
                Delivery Methods
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Choose how you want to receive notifications.
              </p>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pushEnabled"
                    checked={localSettings.pushEnabled}
                    onChange={() => handleSettingChange('pushEnabled')}
                  />
                  <label className="form-check-label" htmlFor="pushEnabled">
                    <strong>Browser Push Notifications</strong>
                    <br />
                    <small className="text-secondary">Receive real-time notifications in your browser</small>
                  </label>
                </div>
                {localSettings.pushEnabled && (
                  <div className="mt-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleTestNotification('push')}
                      disabled={isLoading}
                    >
                      <i className="bi bi-send me-1"></i>
                      Send Test Notification
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailEnabled"
                    checked={localSettings.emailEnabled}
                    onChange={() => handleSettingChange('emailEnabled')}
                    disabled
                  />
                  <label className="form-check-label" htmlFor="emailEnabled">
                    <strong>Email Notifications</strong>
                    <br />
                    <small className="text-secondary">Receive notifications via email (coming soon)</small>
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="smsEnabled"
                    checked={localSettings.smsEnabled}
                    onChange={() => handleSettingChange('smsEnabled')}
                    disabled
                  />
                  <label className="form-check-label" htmlFor="smsEnabled">
                    <strong>SMS Notifications</strong>
                    <br />
                    <small className="text-secondary">Receive notifications via SMS (coming soon)</small>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Schedule */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Notification Schedule
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Set quiet hours when you don&apos;t want to receive notifications.
              </p>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Quiet Hours Start</label>
                    <select className="form-select" defaultValue="22:00" disabled>
                      <option value="18:00">6:00 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="22:00">10:00 PM</option>
                      <option value="23:00">11:00 PM</option>
                      <option value="00:00">12:00 AM</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Quiet Hours End</label>
                    <select className="form-select" defaultValue="08:00" disabled>
                      <option value="06:00">6:00 AM</option>
                      <option value="07:00">7:00 AM</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Note:</strong> Quiet hours feature is coming soon. Notifications will be paused during your selected time range.
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Notification Tips</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6><i className="bi bi-lightbulb text-warning me-2"></i>Stay Informed</h6>
                <p className="small text-secondary mb-3">
                  Enable price alerts to never miss important market movements.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-shield-check text-success me-2"></i>Manage Frequency</h6>
                <p className="small text-secondary mb-3">
                  Use quiet hours to avoid notifications during sleep or work.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-gear text-info me-2"></i>Test Settings</h6>
                <p className="small text-secondary mb-0">
                  Use test notifications to ensure your settings work correctly.
                </p>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h6 className="mb-3">Quick Actions</h6>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={handleSaveAll}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save All Settings
                    </>
                  )}
                </button>
                <Link href="/settings" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
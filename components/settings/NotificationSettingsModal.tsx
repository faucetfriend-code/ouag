'use client';

import { useState, useEffect } from 'react';
import { useUserPreferences } from '@/lib/user-preferences-context';

interface NotificationSettingsModalProps {
  show: boolean;
  onHide: () => void;
}

export default function NotificationSettingsModal({ show, onHide }: NotificationSettingsModalProps) {
  const { preferences, updateNotificationSettings } = useUserPreferences();
  const [localSettings, setLocalSettings] = useState({
    priceAlerts: false,
    analystInsights: false,
    pushEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync local state with preferences when modal opens
  useEffect(() => {
    if (show && preferences?.notificationSettings) {
      setLocalSettings({
        priceAlerts: preferences.notificationSettings.priceAlerts || false,
        analystInsights: preferences.notificationSettings.analystInsights || false,
        pushEnabled: preferences.notificationSettings.pushEnabled || false,
      });
    }
  }, [show, preferences]);

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
      // Close modal after successful save
      onHide();
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setIsLoading(false);
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
                  checked={localSettings.priceAlerts}
                  onChange={() => handleSettingChange('priceAlerts')}
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
                  checked={localSettings.analystInsights}
                  onChange={() => handleSettingChange('analystInsights')}
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
                  checked={localSettings.pushEnabled}
                  onChange={() => handleSettingChange('pushEnabled')}
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
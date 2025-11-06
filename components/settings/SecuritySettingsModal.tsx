'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
// import { Biometric } from '@capgo/capacitor-native-biometric'; // Temporarily disabled
import { showSuccess, showError } from '@/lib/toast';

interface SecuritySettingsModalProps {
  show: boolean;
  onHide: () => void;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number; // minutes
  loginNotifications: boolean;
}

export default function SecuritySettingsModal({ show, onHide }: SecuritySettingsModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    biometricEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);

  // Load security settings when modal opens
  useEffect(() => {
    if (show) {
      loadSecuritySettings();
      checkBiometricAvailability();
      loadActiveSessions();
    }
  }, [show]);

  const loadSecuritySettings = async () => {
    try {
      // INSERTAPIHERE: Fetch current security settings
      const response = await fetch('/api/security/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  };

  const checkBiometricAvailability = async () => {
    // Temporarily disabled - biometric functionality not available
    setBiometricAvailable(false);
    /*
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Biometric.isAvailable();
        setBiometricAvailable(result.isAvailable);
      } catch (error) {
        console.error('Biometric check failed:', error);
        setBiometricAvailable(false);
      }
    }
    */
  };

  const loadActiveSessions = async () => {
    try {
      // INSERTAPIHERE: Fetch active sessions
      const response = await fetch('/api/security/sessions');
      if (response.ok) {
        const sessions = await response.json();
        setActiveSessions(sessions);
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // INSERTAPIHERE: Change password API call
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        showSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onHide();
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to change password');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setIsLoading(true);
    try {
      // INSERTAPIHERE: Toggle 2FA API call
      const response = await fetch('/api/security/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !settings.twoFactorEnabled,
        }),
      });

      if (response.ok) {
        const newSettings = { ...settings, twoFactorEnabled: !settings.twoFactorEnabled };
        setSettings(newSettings);
        showSuccess(`Two-factor authentication ${newSettings.twoFactorEnabled ? 'enabled' : 'disabled'}`);
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to update 2FA settings');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricToggle = async () => {
    // Temporarily disabled - biometric functionality not available
    showError('Biometric authentication is currently not available');
    /*
    if (!biometricAvailable) return;

    setIsLoading(true);
    try {
      if (!settings.biometricEnabled) {
        // Enable biometric - verify first
        const result = await Biometric.verify({
          reason: 'Enable biometric authentication for Unity Oracle',
          title: 'Biometric Authentication',
        });

        if (result.verified) {
          // INSERTAPIHERE: Enable biometric API call
          const response = await fetch('/api/security/biometric', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: true }),
          });

          if (response.ok) {
            setSettings({ ...settings, biometricEnabled: true });
            showSuccess('Biometric authentication enabled');
          } else {
            showError('Failed to enable biometric authentication');
          }
        }
      } else {
        // Disable biometric
        // INSERTAPIHERE: Disable biometric API call
        const response = await fetch('/api/security/biometric', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: false }),
        });

        if (response.ok) {
          setSettings({ ...settings, biometricEnabled: false });
          showSuccess('Biometric authentication disabled');
        } else {
          showError('Failed to disable biometric authentication');
        }
      }
    } catch (error) {
      showError('Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
    */
  };

  const handleSettingChange = async (key: keyof SecuritySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      // INSERTAPIHERE: Update security settings API call
      const response = await fetch('/api/security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        showSuccess('Security settings updated');
      } else {
        showError('Failed to update settings');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      // INSERTAPIHERE: Terminate session API call
      const response = await fetch(`/api/security/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
        showSuccess('Session terminated');
      } else {
        showError('Failed to terminate session');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    }
  };

  const terminateAllOtherSessions = async () => {
    try {
      // INSERTAPIHERE: Terminate all other sessions API call
      const response = await fetch('/api/security/sessions/terminate-others', {
        method: 'POST',
      });

      if (response.ok) {
        loadActiveSessions(); // Refresh the list
        showSuccess('All other sessions terminated');
      } else {
        showError('Failed to terminate sessions');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    }
  };
  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex={-1} style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-shield-check me-2"></i>
              Security Settings
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            {/* Password Change Section */}
            <div className="mb-4">
              <h6 className="mb-3">
                <i className="bi bi-key me-2"></i>
                Change Password
              </h6>
              <form onSubmit={handlePasswordChange}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <div className="form-text">Must be at least 8 characters long</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-key me-2"></i>
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Authentication Methods */}
            <div className="mb-4">
              <h6 className="mb-3">
                <i className="bi bi-fingerprint me-2"></i>
                Authentication Methods
              </h6>

              {/* Two-Factor Authentication */}
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 border rounded">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <i className="bi bi-shield-check me-2 text-primary"></i>
                    <strong>Two-Factor Authentication</strong>
                  </div>
                  <p className="mb-1 small text-secondary">Add an extra layer of security to your account</p>
                  <small className={`badge ${settings.twoFactorEnabled ? 'bg-success' : 'bg-secondary'}`}>
                    {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </small>
                </div>
                <button
                  className={`btn ${settings.twoFactorEnabled ? 'btn-outline-danger' : 'btn-outline-success'} btn-sm`}
                  onClick={handleTwoFactorToggle}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    settings.twoFactorEnabled ? 'Disable' : 'Enable'
                  )}
                </button>
              </div>

              {/* Biometric Authentication */}
              {biometricAvailable && (
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 border rounded">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <i className="bi bi-fingerprint me-2 text-primary"></i>
                      <strong>Biometric Authentication</strong>
                    </div>
                    <p className="mb-1 small text-secondary">Use fingerprint or face recognition to log in</p>
                    <small className={`badge ${settings.biometricEnabled ? 'bg-success' : 'bg-secondary'}`}>
                      {settings.biometricEnabled ? 'Enabled' : 'Disabled'}
                    </small>
                  </div>
                  <button
                    className={`btn ${settings.biometricEnabled ? 'btn-outline-danger' : 'btn-outline-success'} btn-sm`}
                    onClick={handleBiometricToggle}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      settings.biometricEnabled ? 'Disable' : 'Enable'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Session Management */}
            <div className="mb-4">
              <h6 className="mb-3">
                <i className="bi bi-pc-display me-2"></i>
                Session Management
              </h6>

              {/* Session Timeout */}
              <div className="mb-3">
                <label className="form-label">Session Timeout (minutes)</label>
                <select
                  className="form-select"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={240}>4 hours</option>
                  <option value={480}>8 hours</option>
                  <option value={0}>Never</option>
                </select>
              </div>

              {/* Login Notifications */}
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="loginNotifications"
                  checked={settings.loginNotifications}
                  onChange={(e) => handleSettingChange('loginNotifications', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="loginNotifications">
                  <strong>Login Notifications</strong>
                  <br />
                  <small className="text-secondary">Get notified when someone logs into your account</small>
                </label>
              </div>

              {/* Active Sessions */}
              <div className="border rounded p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Active Sessions</h6>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={terminateAllOtherSessions}
                    disabled={activeSessions.length <= 1}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Terminate All Others
                  </button>
                </div>
                <div className="list-group list-group-flush">
                  {activeSessions.length > 0 ? (
                    activeSessions.map((session: any) => (
                      <div key={session.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                        <div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-circle-fill text-success me-2 small"></i>
                            <div>
                              <div className="fw-medium">{session.device || 'Unknown Device'}</div>
                              <small className="text-secondary">
                                {session.location || 'Unknown Location'} • {new Date(session.lastActive).toLocaleString()}
                              </small>
                            </div>
                          </div>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => terminateSession(session.id)}
                          disabled={session.isCurrent}
                        >
                          {session.isCurrent ? 'Current' : 'Terminate'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3 text-secondary">
                      <i className="bi bi-info-circle me-2"></i>
                      Loading active sessions...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="mb-4">
              <h6 className="mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Account Actions
              </h6>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-warning btn-sm text-start">
                  <i className="bi bi-download me-2"></i>
                  Export Account Data
                  <br />
                  <small className="text-secondary">Download a copy of your account data</small>
                </button>
                <button className="btn btn-outline-danger btn-sm text-start">
                  <i className="bi bi-trash me-2"></i>
                  Delete Account
                  <br />
                  <small className="text-secondary">Permanently delete your account and all data</small>
                </button>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
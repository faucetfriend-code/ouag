'use client';

import { useState } from 'react';

interface SecuritySettingsModalProps {
  show: boolean;
  onHide: () => void;
}

export default function SecuritySettingsModal({ show, onHide }: SecuritySettingsModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement password change API call
      console.log('Changing password...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (_error) {
      alert('Error changing password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement 2FA toggle API call
      console.log('Toggling 2FA...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(!twoFactorEnabled);
      alert(`${twoFactorEnabled ? 'Disabled' : 'Enabled'} two-factor authentication`);
    } catch (_error) {
      alert('Error updating 2FA settings');
    } finally {
      setIsLoading(false);
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
              <h6 className="mb-3">Change Password</h6>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
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
                <div className="mb-3">
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
                </div>
                <div className="mb-3">
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

            {/* Two-Factor Authentication Section */}
            <div className="mb-4">
              <h6 className="mb-3">Two-Factor Authentication</h6>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1">Enable two-factor authentication for enhanced security</p>
                  <small className="text-secondary">
                    {twoFactorEnabled ? 'Two-factor authentication is currently enabled' : 'Two-factor authentication is currently disabled'}
                  </small>
                </div>
                <button
                  className={`btn ${twoFactorEnabled ? 'btn-danger' : 'btn-success'}`}
                  onClick={handleTwoFactorToggle}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'
                  )}
                </button>
              </div>
            </div>

            {/* Account Security Section */}
            <div className="mb-4">
              <h6 className="mb-3">Account Security</h6>
              <div className="list-group">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Active Sessions</strong>
                    <br />
                    <small className="text-secondary">Manage your active login sessions</small>
                  </div>
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-eye me-1"></i>
                    View Sessions
                  </button>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Login History</strong>
                    <br />
                    <small className="text-secondary">View recent login activity</small>
                  </div>
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-clock-history me-1"></i>
                    View History
                  </button>
                </div>
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
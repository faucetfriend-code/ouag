'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h1 className="mb-3">Security Settings</h1>
          <p className="text-secondary mb-4">Please log in to access your security settings.</p>
          <Link href="/login" className="btn btn-primary">
            <i className="bi bi-discord me-2"></i>
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'changePassword',
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.error || 'Error changing password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggleTwoFactor',
          enabled: !twoFactorEnabled,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTwoFactorEnabled(!twoFactorEnabled);
        alert(data.message || `${twoFactorEnabled ? 'Disabled' : 'Enabled'} two-factor authentication`);
      } else {
        alert(data.error || 'Error updating 2FA settings');
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      alert('Error updating 2FA settings');
    } finally {
      setIsLoading(false);
    }
  };

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
            Security
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Security Settings</h1>
        <p className="text-secondary mb-0">Manage your account security and authentication preferences</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Password Change Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-key me-2"></i>
                Change Password
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Update your password to keep your account secure. Make sure to choose a strong password.
              </p>
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
                  <div className="form-text">
                    Password must be at least 8 characters long.
                  </div>
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
          </div>

          {/* Two-Factor Authentication Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-shield-check me-2"></i>
                Two-Factor Authentication
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="mb-2">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <div className="mb-3">
                    <span className={`badge ${twoFactorEnabled ? 'bg-success' : 'bg-warning text-dark'}`}>
                      <i className={`bi ${twoFactorEnabled ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-1`}></i>
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {!twoFactorEnabled && (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Recommended:</strong> Enable 2FA to protect your account from unauthorized access.
                    </div>
                  )}
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
          </div>

          {/* Account Security Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-person-lock me-2"></i>
                Account Security
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Active Sessions</strong>
                    <br />
                    <small className="text-secondary">Manage your active login sessions across devices</small>
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
                    <small className="text-secondary">View recent login activity and security events</small>
                  </div>
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-clock-history me-1"></i>
                    View History
                  </button>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Connected Apps</strong>
                    <br />
                    <small className="text-secondary">Manage third-party applications with access to your account</small>
                  </div>
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-app me-1"></i>
                    Manage Apps
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Security Tips</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6><i className="bi bi-check-circle-fill text-success me-2"></i>Use Strong Passwords</h6>
                <p className="small text-secondary mb-3">
                  Use a combination of uppercase, lowercase, numbers, and special characters.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-check-circle-fill text-success me-2"></i>Enable 2FA</h6>
                <p className="small text-secondary mb-3">
                  Two-factor authentication provides an extra layer of security.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-check-circle-fill text-success me-2"></i>Monitor Activity</h6>
                <p className="small text-secondary mb-0">
                  Regularly check your login history and active sessions.
                </p>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body text-center">
              <Link href="/settings" className="btn btn-outline-primary w-100">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
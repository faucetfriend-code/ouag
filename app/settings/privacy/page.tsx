'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [activityTracking, setActivityTracking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h1 className="mb-3">Privacy Settings</h1>
          <p className="text-secondary mb-4">Please log in to access your privacy settings.</p>
          <Link href="/login" className="btn btn-primary">
            <i className="bi bi-discord me-2"></i>
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyticsEnabled,
          marketingEmails,
          dataSharing,
          activityTracking,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update privacy settings');
      }

      const data = await response.json();
      alert('Privacy settings updated successfully!');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      alert('Error updating settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export-data',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export data');
      }

      const data = await response.json();

      // Create download from the returned data
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unity-oracle-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Data export completed! Check your downloads folder.');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
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
            Privacy
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Privacy Settings</h1>
        <p className="text-secondary mb-0">Control your data, privacy preferences, and how your information is used</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Data Collection & Analytics */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Data Collection & Analytics
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Control how we collect and use data to improve your experience.
              </p>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="analyticsEnabled"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="analyticsEnabled">
                    <strong>Analytics & Usage Data</strong>
                    <br />
                    <small className="text-secondary">
                      Help us improve the app by sharing anonymous usage statistics and error reports.
                      No personal information is collected.
                    </small>
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="activityTracking"
                    checked={activityTracking}
                    onChange={(e) => setActivityTracking(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="activityTracking">
                    <strong>Activity Tracking</strong>
                    <br />
                    <small className="text-secondary">
                      Allow us to track your activity patterns to provide personalized recommendations and features.
                    </small>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-envelope me-2"></i>
                Communication Preferences
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Choose what types of communications you&apos;d like to receive.
              </p>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="marketingEmails"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="marketingEmails">
                    <strong>Marketing Emails</strong>
                    <br />
                    <small className="text-secondary">
                      Receive emails about new features, promotions, and platform updates.
                    </small>
                  </label>
                </div>
              </div>

              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Important:</strong> You will still receive essential account notifications (security alerts, account changes) regardless of these settings.
              </div>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-share me-2"></i>
                Data Sharing
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Control whether your data can be shared with third parties.
              </p>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="dataSharing"
                    checked={dataSharing}
                    onChange={(e) => setDataSharing(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="dataSharing">
                    <strong>Third-Party Data Sharing</strong>
                    <br />
                    <small className="text-secondary">
                      Allow sharing of anonymized data with trusted partners for research and platform improvement.
                      Your personal information is never shared.
                    </small>
                  </label>
                </div>
              </div>

              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Privacy First:</strong> We never sell your personal data to third parties. Any data sharing is strictly for platform improvement and is always anonymized.
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-database me-2"></i>
                Data Management
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Download your data or request account deletion.
              </p>

              <div className="row">
                <div className="col-md-6">
                  <div className="d-grid">
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleExportData}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-download me-2"></i>
                          Export My Data
                        </>
                      )}
                    </button>
                  </div>
                  <small className="text-secondary mt-2 d-block">
                    Download a copy of all your data in JSON format.
                  </small>
                </div>

                <div className="col-md-6">
                  <div className="d-grid">
                    <button className="btn btn-outline-danger" disabled>
                      <i className="bi bi-trash me-2"></i>
                      Delete Account
                    </button>
                  </div>
                  <small className="text-secondary mt-2 d-block">
                    Permanently delete your account and all data (coming soon).
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary"
              onClick={handleSave}
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
                  Save Privacy Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Privacy Information</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6><i className="bi bi-shield-check text-success me-2"></i>Data Security</h6>
                <p className="small text-secondary mb-3">
                  All data is encrypted and stored securely. We use industry-standard security practices.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-eye-slash text-info me-2"></i>Your Rights</h6>
                <p className="small text-secondary mb-3">
                  You have the right to access, modify, or delete your personal data at any time.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-file-earmark-text text-primary me-2"></i>Privacy Policy</h6>
                <p className="small text-secondary mb-0">
                  Read our full privacy policy to understand how we handle your data.
                  <br />
                  <a href="#" className="text-primary">View Privacy Policy</a>
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
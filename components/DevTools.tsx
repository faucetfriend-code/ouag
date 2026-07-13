/**
 * Developer Tools Component
 *
 * Provides quick toggles for development features like test user mode
 * Only visible in development mode
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function DevTools() {
  const { user } = useAuth();
  const [isTestUserEnabled, setIsTestUserEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const enabled = localStorage.getItem('enable_test_user') === 'true' ||
                    process.env.NEXT_PUBLIC_ENABLE_TEST_USER === 'true';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dev-only test-user toggle synced from localStorage/env on mount
    setIsTestUserEnabled(enabled);
  }, []);

  const toggleTestUser = () => {
    const newValue = !isTestUserEnabled;
    localStorage.setItem('enable_test_user', String(newValue));
    setIsTestUserEnabled(newValue);

    // Reload page to apply changes
    window.location.reload();
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="position-fixed bottom-0 end-0 m-3 btn btn-dark rounded-circle shadow"
        style={{ width: '50px', height: '50px', zIndex: 1050 }}
        title="Developer Tools"
      >
        <i className="bi bi-code-slash"></i>
      </button>

      {/* Dev tools panel */}
      {isOpen && (
        <div
          className="position-fixed bottom-0 end-0 m-3 mb-5 card shadow-lg"
          style={{ width: '300px', zIndex: 1040 }}
        >
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <i className="bi bi-tools me-2"></i>
              Dev Tools
            </h6>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-outline-light"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
          <div className="card-body">
            {/* Test User Toggle */}
            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="testUserToggle"
                  checked={isTestUserEnabled}
                  onChange={toggleTestUser}
                />
                <label className="form-check-label" htmlFor="testUserToggle">
                  <strong>Test User Mode</strong>
                </label>
              </div>
              <small className="text-muted">
                {isTestUserEnabled
                  ? 'Auto-login as test user (bypass Discord)'
                  : 'Require Discord authentication'}
              </small>
            </div>

            {/* Current User Info */}
            <div className="border-top pt-3">
              <h6 className="mb-2">Current User:</h6>
              {user ? (
                <div className="small">
                  <div><strong>Name:</strong> {user.name}</div>
                  <div><strong>Username:</strong> @{user.username}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div>
                    <strong>Premium:</strong>{' '}
                    <span className={user.subscription?.active ? 'text-success' : 'text-danger'}>
                      {user.subscription?.active ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {user.subscription?.active && (
                    <div className="text-muted">Plan: {user.subscription.plan}</div>
                  )}
                </div>
              ) : (
                <div className="text-muted small">Not logged in</div>
              )}
            </div>

            {/* Environment Info */}
            <div className="border-top pt-3 mt-3">
              <h6 className="mb-2">Environment:</h6>
              <div className="small">
                <div><strong>Mode:</strong> {process.env.NODE_ENV}</div>
                <div>
                  <strong>Test User Env:</strong>{' '}
                  {process.env.NEXT_PUBLIC_ENABLE_TEST_USER === 'true' ? 'Enabled' : 'Disabled'}
                </div>
                <div>
                  <strong>Mock Data:</strong>{' '}
                  {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

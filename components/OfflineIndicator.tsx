/**
 * Offline Indicator Component
 *
 * Shows a banner when the user loses internet connection.
 * Automatically hides when connection is restored.
 */

'use client';

import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  // Initialize with navigator.onLine (lazy initialization to avoid setState in effect)
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" message briefly
      if (wasOffline) {
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Show "back online" message
  if (isOnline && wasOffline) {
    return (
      <div
        className="position-fixed bottom-0 start-50 translate-middle-x mb-3 px-4 py-2 rounded shadow-lg"
        style={{
          backgroundColor: '#10b981',
          color: '#fff',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease-out',
        }}
        role="status"
        aria-live="polite"
      >
        <i className="bi bi-wifi me-2" aria-hidden="true"></i>
        Back online
      </div>
    );
  }

  // Show offline message
  if (!isOnline) {
    return (
      <div
        className="position-fixed bottom-0 start-50 translate-middle-x mb-3 px-4 py-2 rounded shadow-lg"
        style={{
          backgroundColor: '#b91c1c',
          color: '#fff',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease-out',
        }}
        role="alert"
        aria-live="assertive"
      >
        <i className="bi bi-wifi-off me-2" aria-hidden="true"></i>
        You are offline. Some features may be limited.
      </div>
    );
  }

  return null;
}

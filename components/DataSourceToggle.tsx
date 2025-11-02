/**
 * Data Source Toggle Component
 *
 * Allows users to switch between mock data (UI development) and Redis data (production).
 * Shows current data source and provides a toggle button.
 */

'use client';

import { useState, useEffect } from 'react';
import { showSuccess, showInfo } from '@/lib/toast';

type DataSource = 'mock' | 'redis';

const STORAGE_KEY = 'unity_oracle_data_source';

export default function DataSourceToggle() {
  const [dataSource, setDataSource] = useState<DataSource>('mock');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load preference from localStorage
    const stored = localStorage.getItem(STORAGE_KEY) as DataSource;
    if (stored === 'mock' || stored === 'redis') {
      setDataSource(stored);
    } else {
      // Default to env variable
      const envDefault = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'mock' : 'redis';
      setDataSource(envDefault);
      localStorage.setItem(STORAGE_KEY, envDefault);
    }
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const newSource: DataSource = dataSource === 'mock' ? 'redis' : 'mock';
    localStorage.setItem(STORAGE_KEY, newSource);

    showInfo(`Switching to ${newSource === 'mock' ? 'Mock Data' : 'Redis Data'}...`);

    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const isMock = dataSource === 'mock';

  return (
    <div className="card border-warning">
      <div className="card-body">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h6 className="card-title mb-2">
              <i className="bi bi-database me-2" aria-hidden="true"></i>
              Data Source
            </h6>
            <div className="d-flex align-items-center gap-2">
              <span className={`badge ${isMock ? 'bg-warning text-dark' : 'bg-success'}`}>
                {isMock ? '📝 Mock Data (UI Development)' : '🔗 Redis Database (Production)'}
              </span>
            </div>
            <small className="text-secondary d-block mt-2">
              {isMock
                ? 'Using static mock data for UI development and testing'
                : 'Connected to Redis database with live workflow data'
              }
            </small>
          </div>
          <button
            onClick={handleToggle}
            className="btn btn-outline-warning"
            aria-label={`Switch to ${isMock ? 'Redis' : 'Mock'} data`}
          >
            <i className={`bi ${isMock ? 'bi-lightning' : 'bi-pencil-square'} me-2`} aria-hidden="true"></i>
            Switch to {isMock ? 'Redis' : 'Mock'}
          </button>
        </div>
      </div>
    </div>
  );
}

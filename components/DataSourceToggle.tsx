/**
 * Analyst Data Source Toggle Component
 *
 * Allows users to switch between mock data (UI development) and Redis data (production)
 * for ANALYST INSIGHTS AND QUOTES ONLY.
 *
 * Other features (Tools, News, Airdrops) have separate data sources.
 * Uses cookies instead of localStorage to work with server-side rendering.
 */

'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { showSuccess, showInfo } from '@/lib/toast';

type DataSource = 'mock' | 'redis';

const COOKIE_NAME = 'analyst_data_source';

export default function DataSourceToggle() {
  // Initialize with lazy evaluation to avoid setState in useEffect
  const [dataSource, setDataSource] = useState<DataSource>(() => {
    if (typeof window === 'undefined') return 'mock';

    const stored = Cookies.get(COOKIE_NAME) as DataSource;
    if (stored === 'mock' || stored === 'redis') {
      return stored;
    }
    // Default to env variable
    const envDefault = (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'mock' : 'redis') as DataSource;
    // Set cookie with 1 year expiration
    Cookies.set(COOKIE_NAME, envDefault, { expires: 365 });
    return envDefault;
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const newSource: DataSource = dataSource === 'mock' ? 'redis' : 'mock';
    // Set cookie with 1 year expiration
    Cookies.set(COOKIE_NAME, newSource, { expires: 365 });

    showInfo(`Switching analyst data to ${newSource === 'mock' ? 'Mock' : 'Redis'}...`);

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
              <i className="bi bi-graph-up me-2" aria-hidden="true"></i>
              Analyst Data Source
            </h6>
            <div className="d-flex align-items-center gap-2">
              <span className={`badge ${isMock ? 'bg-warning text-dark' : 'bg-success'}`}>
                {isMock ? '📝 Mock Data (UI Development)' : '🔗 Redis Database (Live)'}
              </span>
            </div>
            <small className="text-secondary d-block mt-2">
              {isMock
                ? 'Using static mock data for analyst insights and quotes (UI testing)'
                : 'Connected to Redis with live analyst insights from workflow'
              }
            </small>
            <small className="text-muted d-block mt-1" style={{fontSize: '0.75rem'}}>
              Note: This only controls analyst data. Tools, News, and Airdrops use separate databases.
            </small>
          </div>
          <button
            onClick={handleToggle}
            className="btn btn-outline-warning"
            aria-label={`Switch analyst data to ${isMock ? 'Redis' : 'Mock'}`}
          >
            <i className={`bi ${isMock ? 'bi-lightning' : 'bi-pencil-square'} me-2`} aria-hidden="true"></i>
            Switch to {isMock ? 'Redis' : 'Mock'}
          </button>
        </div>
      </div>
    </div>
  );
}

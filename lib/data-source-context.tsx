/**
 * Data Source Context
 *
 * Allows runtime switching between mock data and Redis data.
 * Persists preference to localStorage.
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type DataSource = 'mock' | 'redis';

interface DataSourceContextType {
  dataSource: DataSource;
  toggleDataSource: () => void;
  setDataSource: (source: DataSource) => void;
  isUsingMockData: boolean;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

const STORAGE_KEY = 'unity_oracle_data_source';

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [dataSource, setDataSourceState] = useState<DataSource>('mock');
  const [mounted, setMounted] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as DataSource;
    if (stored === 'mock' || stored === 'redis') {
      setDataSourceState(stored);
    } else {
      // Default to env variable if available
      const envDefault = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'mock' : 'redis';
      setDataSourceState(envDefault);
    }
    setMounted(true);
  }, []);

  const setDataSource = (source: DataSource) => {
    setDataSourceState(source);
    localStorage.setItem(STORAGE_KEY, source);
    // Force page reload to apply changes
    window.location.reload();
  };

  const toggleDataSource = () => {
    const newSource = dataSource === 'mock' ? 'redis' : 'mock';
    setDataSource(newSource);
  };

  const value = {
    dataSource,
    toggleDataSource,
    setDataSource,
    isUsingMockData: dataSource === 'mock',
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}

// Helper function to get data source preference (can be used in non-React code)
export function getDataSourcePreference(): DataSource {
  if (typeof window === 'undefined') {
    // Server-side: use env variable
    return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'mock' : 'redis';
  }

  // Client-side: check localStorage first, then env variable
  const stored = localStorage.getItem(STORAGE_KEY) as DataSource;
  if (stored === 'mock' || stored === 'redis') {
    return stored;
  }

  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'mock' : 'redis';
}

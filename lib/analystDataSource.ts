/**
 * Analyst Data Source Layer with Cookie-Based Feature Flag
 *
 * This module provides a unified interface for analyst data access that can toggle
 * between mock data (for UI development) and real Redis data (for production).
 *
 * IMPORTANT: This data source is ONLY for analyst insights and quotes.
 * Other features (Tools, News, Airdrops) have separate data sources.
 *
 * Toggle between modes using:
 * 1. Runtime: Cookie 'analyst_data_source' (checked first - works on server and client)
 * 2. Build time: NEXT_PUBLIC_USE_MOCK_DATA environment variable (fallback)
 */

import Cookies from 'js-cookie';
import * as mockDataFunctions from './mockDataFunctions';
import * as serverDataFunctions from './serverData';

const COOKIE_NAME = 'analyst_data_source';

/**
 * Helper to get data source preference from cookies or environment
 * Works on both server-side and client-side
 */
function getDataSourcePreference(): boolean {
  // Client-side: Use js-cookie
  if (typeof window !== 'undefined') {
    const stored = Cookies.get(COOKIE_NAME);
    if (stored === 'mock') return true;
    if (stored === 'redis') return false;
  }
  // Server-side: Parse cookies header (for Server Components)
  else if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const analystCookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
    if (analystCookie) {
      const value = analystCookie.split('=')[1]?.trim();
      if (value === 'mock') return true;
      if (value === 'redis') return false;
    }
  }

  // Default to environment variable setting
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
}

/**
 * Dynamic data source selection - checks preference on each call
 * This ensures the toggle works after page reload
 */
function shouldUseMockData(): boolean {
  return getDataSourcePreference();
}

// Export wrapper functions that check preference dynamically
export async function getTradingPostsByToken(token: string) {
  return shouldUseMockData()
    ? mockDataFunctions.getTradingPostsByToken(token)
    : serverDataFunctions.getTradingPostsByToken(token);
}

export async function getChartDataForToken(token: string) {
  return shouldUseMockData()
    ? mockDataFunctions.getChartDataForToken(token)
    : serverDataFunctions.getChartDataForToken(token);
}

export async function getAllTokens() {
  return shouldUseMockData()
    ? mockDataFunctions.getAllTokens()
    : serverDataFunctions.getAllTokens();
}

export async function getAnalystStats() {
  return shouldUseMockData()
    ? mockDataFunctions.getAnalystStats()
    : serverDataFunctions.getAnalystStats();
}

export async function getRecentPosts(limit?: number) {
  return shouldUseMockData()
    ? mockDataFunctions.getRecentPosts(limit)
    : serverDataFunctions.getRecentPosts(limit);
}

// Export helper to check which mode we're in
export const isUsingMockData = () => shouldUseMockData();

// Log the current mode (only in development, client-side only to avoid server logs)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log(
    `[AnalystDataSource] Using ${shouldUseMockData() ? 'MOCK' : 'REDIS'} data source`
  );
}

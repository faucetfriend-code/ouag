/**
 * Data Source Layer with Feature Flag
 *
 * This module provides a unified interface for data access that can toggle
 * between mock data (for UI development) and real Redis data (for production).
 *
 * Toggle between modes using the NEXT_PUBLIC_USE_MOCK_DATA environment variable:
 * - true: Use mock data from mockDataFunctions (UI development)
 * - false: Use real Redis data from serverData (production)
 */

// Check if we should use mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Conditionally import the appropriate data source
// Note: Both imports are always evaluated, but we only use one
import * as mockDataFunctions from './mockDataFunctions';
import * as serverDataFunctions from './serverData';

// Export the appropriate functions based on the feature flag
export const getTradingPostsByToken = USE_MOCK_DATA
  ? mockDataFunctions.getTradingPostsByToken
  : serverDataFunctions.getTradingPostsByToken;

export const getChartDataForToken = USE_MOCK_DATA
  ? mockDataFunctions.getChartDataForToken
  : serverDataFunctions.getChartDataForToken;

export const getAllTokens = USE_MOCK_DATA
  ? mockDataFunctions.getAllTokens
  : serverDataFunctions.getAllTokens;

export const getAnalystStats = USE_MOCK_DATA
  ? mockDataFunctions.getAnalystStats
  : serverDataFunctions.getAnalystStats;

export const getRecentPosts = USE_MOCK_DATA
  ? mockDataFunctions.getRecentPosts
  : serverDataFunctions.getRecentPosts;

// Export a helper to check which mode we're in
export const isUsingMockData = () => USE_MOCK_DATA;

// Log the current mode (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log(
    `[DataSource] Using ${USE_MOCK_DATA ? 'MOCK' : 'REDIS'} data source`
  );
}

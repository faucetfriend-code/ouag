/**
 * Data Summarization Utilities
 *
 * Functions for creating human-readable summaries of trading data.
 */

import { TradingPost } from '../data/mockData';

/**
 * SUMMARIZE TOKEN DATA
 * Creates a concise summary of analyst sentiment for a token
 *
 * @param posts - Array of trading posts for a specific token
 * @returns String summary with post count and overall sentiment
 */
export const summarizeTokenData = (posts: TradingPost[]): string => {
  // Handle empty data case
  if (posts.length === 0) return 'No data available';

  // Extract analysis texts and filter out null/undefined values
  const analyses = posts.map(p => p.analysis).filter(Boolean);

  // Analyze sentiment of each analysis text
  const sentiments = analyses.map(a =>
    a!.toLowerCase().includes('bullish') ? 'bullish' :
    a!.toLowerCase().includes('bearish') ? 'bearish' :
    'neutral'
  );

  // Count sentiment occurrences
  const bullishCount = sentiments.filter(s => s === 'bullish').length;
  const bearishCount = sentiments.filter(s => s === 'bearish').length;

  // Build summary string
  let summary = `Total posts: ${posts.length}. `;

  // Determine overall sentiment based on counts
  if (bullishCount > bearishCount) {
    summary += 'Overall bullish sentiment.';
  } else if (bearishCount > bullishCount) {
    summary += 'Overall bearish sentiment.';
  } else {
    summary += 'Mixed sentiment.';
  }

  return summary;
};
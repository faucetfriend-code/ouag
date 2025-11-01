import { TradingPost } from '../data/mockData';

export const summarizeTokenData = (posts: TradingPost[]): string => {
  if (posts.length === 0) return 'No data available';

  const analyses = posts.map(p => p.analysis).filter(Boolean);
  const sentiments = analyses.map(a => a!.toLowerCase().includes('bullish') ? 'bullish' : a!.toLowerCase().includes('bearish') ? 'bearish' : 'neutral');

  const bullishCount = sentiments.filter(s => s === 'bullish').length;
  const bearishCount = sentiments.filter(s => s === 'bearish').length;

  let summary = `Total posts: ${posts.length}. `;
  if (bullishCount > bearishCount) {
    summary += 'Overall bullish sentiment.';
  } else if (bearishCount > bullishCount) {
    summary += 'Overall bearish sentiment.';
  } else {
    summary += 'Mixed sentiment.';
  }

  return summary;
};
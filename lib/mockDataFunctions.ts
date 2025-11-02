/**
 * Mock data functions for UI development
 *
 * These functions simulate the Redis data access layer using static mock data.
 * Use these during UI development when Redis is not available.
 */

import { mockTradingPosts, tokens, TradingPost } from '../data/mockData';

export async function getTradingPostsByToken(token: string): Promise<TradingPost[]> {
  // Simulate async operation
  return Promise.resolve(
    mockTradingPosts.filter(post => post.token === token)
  );
}

export async function getChartDataForToken(token: string): Promise<number[] | undefined> {
  const tokenPosts = mockTradingPosts.filter(post => post.token === token);
  const postWithChart = tokenPosts.find(post => post.chartData);
  return Promise.resolve(postWithChart?.chartData);
}

export async function getAllTokens(): Promise<string[]> {
  return Promise.resolve(tokens);
}

export async function getAnalystStats() {
  const uniqueAnalysts = new Set(mockTradingPosts.map(p => p.user));
  return Promise.resolve({
    totalPosts: mockTradingPosts.length,
    activeAnalysts: uniqueAnalysts.size,
    tokensTracked: tokens.length,
    latestUpdate: new Date()
  });
}

export async function getRecentPosts(limit: number = 20) {
  // Sort by timestamp descending and take the limit
  const sortedPosts = [...mockTradingPosts].sort((a, b) =>
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  return Promise.resolve(sortedPosts.slice(0, limit));
}

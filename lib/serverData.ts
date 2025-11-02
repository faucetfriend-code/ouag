/**
 * Server-side data fetching functions
 *
 * These functions run only on the server and use Redis for data storage.
 * They provide data to server components and API routes.
 */

import 'server-only';
import { redisService } from './redis';
import { TradingPost } from '../data/mockData';

export async function getTradingPostsByToken(token: string): Promise<TradingPost[]> {
  try {
    const posts = await redisService.getPostsByToken(token);
    return posts.map(post => ({
      id: post.id,
      user: post.user,
      channel: post.channel,
      token: post.token,
      content: post.content,
      timestamp: post.timestamp,
      analysis: post.analysis,
      chartData: post.chartData
    }));
  } catch (error) {
    console.error('Error fetching posts from Redis:', error);
    // Fallback to empty array - will be handled by components
    return [];
  }
}

export async function getChartDataForToken(token: string): Promise<number[] | undefined> {
  try {
    return await redisService.getChartData(token) || undefined;
  } catch (error) {
    console.error('Error fetching chart data from Redis:', error);
    return undefined;
  }
}

export async function getAllTokens(): Promise<string[]> {
  // Static list for now - could be fetched from Redis in the future
  return ['BTC', 'ETH', 'ADA', 'SOL', 'DOGE', 'LINK', 'UNI', 'AVAX', 'MATIC', 'DOT'];
}

export async function getAnalystStats() {
  try {
    return await redisService.getAnalystStats();
  } catch (error) {
    console.error('Error fetching analyst stats from Redis:', error);
    // Return default stats
    return {
      totalPosts: 0,
      activeAnalysts: 0,
      tokensTracked: 10,
      latestUpdate: null
    };
  }
}

export async function getRecentPosts(limit: number = 20) {
  try {
    return await redisService.getRecentPosts(limit);
  } catch (error) {
    console.error('Error fetching recent posts from Redis:', error);
    return [];
  }
}
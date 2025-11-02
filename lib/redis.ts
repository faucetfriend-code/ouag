/**
 * Redis Database Service
 *
 * Handles all database operations for the Unity Oracle Aggregator using Redis.
 * Stores trading posts, chart data, and analysis summaries.
 */

import { createClient, RedisClientType } from 'redis';
import { TradingPost, mockTradingPosts } from '../data/mockData';
import { ProcessedPost } from './workflow';

class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.on('connect', () => {
      console.log('Connected to Redis');
      this.isConnected = true;
    });
    this.client.on('disconnect', () => {
      console.log('Disconnected from Redis');
      this.isConnected = false;
    });
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  /**
   * STORE PROCESSED POST
   * Saves a processed trading post to Redis
   */
  async storePost(post: ProcessedPost): Promise<void> {
    await this.connect();

    const key = `post:${post.id}`;
    const data = JSON.stringify({
      ...post,
      storedAt: new Date().toISOString()
    });

    // Store post data
    await this.client.set(key, data);

    // Add to token index
    await this.client.sAdd(`token:${post.token}:posts`, post.id);

    // Add to user index
    await this.client.sAdd(`user:${post.user}:posts`, post.id);

    // Add to timeline (sorted set by timestamp)
    await this.client.zAdd(`timeline:${post.token}`, {
      score: post.timestamp.getTime(),
      value: post.id
    });

    // Update chart data if available
    if (post.chartData) {
      await this.updateChartData(post.token, post.chartData);
    }

    console.log(`Stored post ${post.id} for token ${post.token}`);
  }

  /**
   * UPDATE CHART DATA
   * Updates the chart data points for a token
   */
  async updateChartData(token: string, newDataPoints: number[]): Promise<void> {
    await this.connect();

    const key = `chart:${token}`;
    const data = JSON.stringify({
      token,
      dataPoints: newDataPoints,
      lastUpdated: new Date().toISOString()
    });

    await this.client.set(key, data);
    console.log(`Updated chart data for ${token}`);
  }

  /**
   * UPDATE POST ANALYSIS
   * Updates the AI analysis for an existing post (for external summary processing)
   */
  async updatePostAnalysis(postId: string, analysis: any): Promise<void> {
    await this.connect();

    const key = `post:${postId}`;
    const existingData = await this.client.get(key);

    if (!existingData) {
      throw new Error(`Post ${postId} not found`);
    }

    const post = JSON.parse(existingData);
    post.aiAnalysis = analysis;
    post.analysis = analysis.summary;
    post.updatedAt = new Date().toISOString();

    await this.client.set(key, JSON.stringify(post));
    console.log(`Updated analysis for post ${postId}`);
  }

  /**
   * GET POSTS BY TOKEN
   * Retrieves all posts for a specific token
   */
  async getPostsByToken(token: string, limit: number = 50): Promise<ProcessedPost[]> {
    await this.connect();

    const postIds = await this.client.zRange(`timeline:${token}`, 0, limit - 1, { REV: true });

    if (postIds.length === 0) {
      return [];
    }

    const posts: ProcessedPost[] = [];
    for (const postId of postIds) {
      const data = await this.client.get(`post:${postId}`);
      if (data) {
        const post = JSON.parse(data);
        // Convert timestamp back to Date object
        post.timestamp = new Date(post.timestamp);
        posts.push(post);
      }
    }

    return posts;
  }

  /**
   * GET CHART DATA
   * Retrieves chart data points for a token
   */
  async getChartData(token: string): Promise<number[] | null> {
    await this.connect();

    const data = await this.client.get(`chart:${token}`);
    if (!data) return null;

    const chartData = JSON.parse(data);
    return chartData.dataPoints || null;
  }

  /**
   * GET POST BY ID
   * Retrieves a specific post by ID
   */
  async getPostById(postId: string): Promise<ProcessedPost | null> {
    await this.connect();

    const data = await this.client.get(`post:${postId}`);
    if (!data) return null;

    const post = JSON.parse(data);
    post.timestamp = new Date(post.timestamp);
    return post;
  }

  /**
   * GET RECENT POSTS
   * Retrieves recent posts across all tokens
   */
  async getRecentPosts(limit: number = 20): Promise<ProcessedPost[]> {
    await this.connect();

    // Get all tokens
    const tokenKeys = await this.client.keys('timeline:*');
    const tokens = tokenKeys.map(key => key.replace('timeline:', ''));

    // Get recent posts from each token
    const allPosts: ProcessedPost[] = [];
    for (const token of tokens) {
      const posts = await this.getPostsByToken(token, Math.ceil(limit / tokens.length));
      allPosts.push(...posts);
    }

    // Sort by timestamp and limit
    return allPosts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * GET ANALYST STATS
   * Returns statistics about analysts and posts
   */
  async getAnalystStats(): Promise<{
    totalPosts: number;
    activeAnalysts: number;
    tokensTracked: number;
    latestUpdate: Date | null;
  }> {
    await this.connect();

    const postKeys = await this.client.keys('post:*');
    const userKeys = await this.client.keys('user:*:posts');
    const tokenKeys = await this.client.keys('timeline:*');

    let latestUpdate: Date | null = null;

    // Find latest post timestamp
    for (const postKey of postKeys.slice(0, 10)) { // Check first 10 posts
      const data = await this.client.get(postKey);
      if (data) {
        const post = JSON.parse(data);
        const postDate = new Date(post.timestamp);
        if (!latestUpdate || postDate > latestUpdate) {
          latestUpdate = postDate;
        }
      }
    }

    return {
      totalPosts: postKeys.length,
      activeAnalysts: userKeys.length,
      tokensTracked: tokenKeys.length,
      latestUpdate
    };
  }

  /**
   * SEED INITIAL DATA
   * Loads mock data into Redis for development
   */
  async seedInitialData(): Promise<void> {
    await this.connect();

    console.log('Seeding initial data...');

    // Convert mock posts to processed format
    for (const mockPost of mockTradingPosts) {
      const processedPost: ProcessedPost = {
        id: mockPost.id,
        user: mockPost.user,
        channel: 'mock',
        token: mockPost.token,
        content: mockPost.content,
        timestamp: mockPost.timestamp,
        analysis: mockPost.analysis,
        contentType: 'full',
        originalLength: mockPost.content.length,
        aiAnalysis: undefined,
        extractedData: {
          tokens: [mockPost.token],
          sentiment: 'neutral',
          confidence: 0.5
        },
        chartData: mockPost.chartData
      };

      await this.storePost(processedPost);
    }

    console.log('Initial data seeded successfully');
  }

  /**
   * CLEAR ALL DATA
   * Removes all data from Redis (for testing)
   */
  async clearAllData(): Promise<void> {
    await this.connect();

    const keys = await this.client.keys('*');
    if (keys.length > 0) {
      await this.client.del(keys);
    }
    console.log('All data cleared');
  }

  /**
   * INVALIDATE TOKEN CACHE
   * Sets a cache invalidation flag for a specific token
   */
  async invalidateTokenCache(token: string): Promise<void> {
    await this.connect();
    await this.client.set(`cache:invalidate:${token}`, Date.now().toString(), {
      EX: 300 // Expire in 5 minutes
    });
    console.log(`Invalidated cache for token: ${token}`);
  }

  /**
   * INVALIDATE STATS CACHE
   * Removes the global stats cache
   */
  async invalidateStatsCache(): Promise<void> {
    await this.connect();
    await this.client.del('cache:stats');
    console.log('Invalidated global stats cache');
  }

  /**
   * HEALTH CHECK
   * Verifies Redis connection and basic operations
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.connect();
      await this.client.set('health_check', 'ok');
      const result = await this.client.get('health_check');
      await this.client.del('health_check');
      return result === 'ok';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * GENERIC DATA STORAGE METHODS
   * For storing arbitrary key-value data
   */

  async set(key: string, value: string): Promise<void> {
    await this.connect();
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    await this.connect();
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.connect();
    await this.client.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    await this.connect();
    return await this.client.keys(pattern);
  }
}

// Export singleton instance
export const redisService = new RedisService();

// Helper function to initialize Redis on app startup
export async function initializeRedis(): Promise<void> {
  try {
    await redisService.connect();

    // Seed initial data if database is empty
    const stats = await redisService.getAnalystStats();
    if (stats.totalPosts === 0) {
      await redisService.seedInitialData();
    }

    console.log('Redis initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
  }
}
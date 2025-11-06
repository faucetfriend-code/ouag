/**
 * Redis Database Service (Dual-Mode)
 *
 * Handles all database operations for the Unity Oracle Aggregator using Redis.
 * Stores trading posts, chart data, and analysis summaries.
 *
 * Supports two modes:
 * - TCP Mode: Redis Cloud (local development, unlimited commands)
 * - REST Mode: Vercel KV (serverless deployment, 3K commands/day free)
 *
 * Mode is automatically selected based on environment:
 * - VERCEL env var present → REST mode (Vercel KV)
 * - No VERCEL env var → TCP mode (Redis Cloud)
 */

import { createClient, RedisClientType } from 'redis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { mockTradingPosts } from '../data/mockData';
import { ProcessedPost } from './workflow';

type RedisMode = 'tcp' | 'rest';

class RedisService {
  private client: RedisClientType | null = null;
  private restClient: UpstashRedis | null = null;
  private mode: RedisMode;
  private isConnected: boolean = false;

  constructor() {
    // Detect environment and choose appropriate Redis client
    const isVercel = !!process.env.VERCEL;
    this.mode = isVercel ? 'rest' : 'tcp';

    if (this.mode === 'rest') {
      // Vercel serverless: use REST API (Vercel KV)
      const url = process.env.UAO_KV_REST_API_URL;
      const token = process.env.UAO_KV_REST_API_TOKEN;

      if (!url || !token) {
        console.error('Vercel KV credentials missing. Set UAO_KV_REST_API_URL and UAO_KV_REST_API_TOKEN');
        throw new Error('Vercel KV credentials not configured');
      }

      this.restClient = new UpstashRedis({ url, token });
      this.isConnected = true; // REST client doesn't need explicit connection
      console.log('Using Vercel KV (REST mode)');
    } else {
      // Local development: use TCP connection (Redis Cloud)
      const url = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = createClient({ url });

      this.client.on('error', (err) => console.error('Redis Client Error', err));
      this.client.on('connect', () => {
        console.log('Connected to Redis Cloud (TCP mode)');
        this.isConnected = true;
      });
      this.client.on('disconnect', () => {
        console.log('Disconnected from Redis Cloud');
        this.isConnected = false;
      });
    }
  }

  /**
   * Initialize Redis connection (TCP mode only, REST is always connected)
   */
  async connect(): Promise<void> {
    if (this.mode === 'tcp' && !this.isConnected && this.client) {
      await this.client.connect();
    }
  }

  /**
   * Close Redis connection (TCP mode only)
   */
  async disconnect(): Promise<void> {
    if (this.mode === 'tcp' && this.isConnected && this.client) {
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

    if (this.mode === 'rest' && this.restClient) {
      // REST mode: Vercel KV
      await this.restClient.set(key, data);
      await this.restClient.sadd(`token:${post.token}:posts`, post.id);
      await this.restClient.sadd(`user:${post.user}:posts`, post.id);
      await this.restClient.zadd(`timeline:${post.token}`, {
        score: post.timestamp.getTime(),
        member: post.id
      });
    } else if (this.mode === 'tcp' && this.client) {
      // TCP mode: Redis Cloud
      await this.client.set(key, data);
      await this.client.sAdd(`token:${post.token}:posts`, post.id);
      await this.client.sAdd(`user:${post.user}:posts`, post.id);
      await this.client.zAdd(`timeline:${post.token}`, {
        score: post.timestamp.getTime(),
        value: post.id
      });
    }

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

    if (this.mode === 'rest' && this.restClient) {
      await this.restClient.set(key, data);
    } else if (this.mode === 'tcp' && this.client) {
      await this.client.set(key, data);
    }

    console.log(`Updated chart data for ${token}`);
  }

  /**
   * UPDATE POST ANALYSIS
   * Updates the AI analysis for an existing post (for external summary processing)
   */
  async updatePostAnalysis(postId: string, analysis: any): Promise<void> {
    await this.connect();

    const key = `post:${postId}`;
    let existingData: string | null = null;

    if (this.mode === 'rest' && this.restClient) {
      existingData = await this.restClient.get(key);
    } else if (this.mode === 'tcp' && this.client) {
      existingData = await this.client.get(key);
    }

    if (!existingData) {
      throw new Error(`Post ${postId} not found`);
    }

    const post = JSON.parse(existingData);
    post.aiAnalysis = analysis;
    post.analysis = analysis.summary;
    post.updatedAt = new Date().toISOString();

    const updatedData = JSON.stringify(post);

    if (this.mode === 'rest' && this.restClient) {
      await this.restClient.set(key, updatedData);
    } else if (this.mode === 'tcp' && this.client) {
      await this.client.set(key, updatedData);
    }

    console.log(`Updated analysis for post ${postId}`);
  }

  /**
   * GET POSTS BY TOKEN
   * Retrieves all posts for a specific token
   */
  async getPostsByToken(token: string, limit: number = 50): Promise<ProcessedPost[]> {
    await this.connect();

    let postIds: string[] = [];

    if (this.mode === 'rest' && this.restClient) {
      // REST mode: zrange returns array directly
      postIds = await this.restClient.zrange(`timeline:${token}`, 0, limit - 1, { rev: true });
    } else if (this.mode === 'tcp' && this.client) {
      // TCP mode: uses REV option
      postIds = await this.client.zRange(`timeline:${token}`, 0, limit - 1, { REV: true });
    }

    if (postIds.length === 0) {
      return [];
    }

    const posts: ProcessedPost[] = [];
    for (const postId of postIds) {
      let data: string | null = null;

      if (this.mode === 'rest' && this.restClient) {
        data = await this.restClient.get(`post:${postId}`);
      } else if (this.mode === 'tcp' && this.client) {
        data = await this.client.get(`post:${postId}`);
      }

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

    let data: string | null = null;

    if (this.mode === 'rest' && this.restClient) {
      data = await this.restClient.get(`chart:${token}`);
    } else if (this.mode === 'tcp' && this.client) {
      data = await this.client.get(`chart:${token}`);
    }

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

    let data: string | null = null;

    if (this.mode === 'rest' && this.restClient) {
      data = await this.restClient.get(`post:${postId}`);
    } else if (this.mode === 'tcp' && this.client) {
      data = await this.client.get(`post:${postId}`);
    }

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
    let tokenKeys: string[] = [];

    if (this.mode === 'rest' && this.restClient) {
      tokenKeys = await this.restClient.keys('timeline:*');
    } else if (this.mode === 'tcp' && this.client) {
      tokenKeys = await this.client.keys('timeline:*');
    }

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

    let postKeys: string[] = [];
    let userKeys: string[] = [];
    let tokenKeys: string[] = [];

    if (this.mode === 'rest' && this.restClient) {
      postKeys = await this.restClient.keys('post:*');
      userKeys = await this.restClient.keys('user:*:posts');
      tokenKeys = await this.restClient.keys('timeline:*');
    } else if (this.mode === 'tcp' && this.client) {
      postKeys = await this.client.keys('post:*');
      userKeys = await this.client.keys('user:*:posts');
      tokenKeys = await this.client.keys('timeline:*');
    }

    let latestUpdate: Date | null = null;

    // Find latest post timestamp
    for (const postKey of postKeys.slice(0, 10)) { // Check first 10 posts
      let data: string | null = null;

      if (this.mode === 'rest' && this.restClient) {
        data = await this.restClient.get(postKey);
      } else if (this.mode === 'tcp' && this.client) {
        data = await this.client.get(postKey);
      }

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
          confidence: 0.5,
          author: {
            id: 'mock-user',
            username: mockPost.user
          },
          platform: 'manual'
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

    let keys: string[] = [];

    if (this.mode === 'rest' && this.restClient) {
      keys = await this.restClient.keys('*');
      if (keys.length > 0) {
        await this.restClient.del(...keys);
      }
    } else if (this.mode === 'tcp' && this.client) {
      keys = await this.client.keys('*');
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    }

    console.log('All data cleared');
  }

  /**
   * INVALIDATE TOKEN CACHE
   * Sets a cache invalidation flag for a specific token
   */
  async invalidateTokenCache(token: string): Promise<void> {
    await this.connect();

    const key = `cache:invalidate:${token}`;
    const value = Date.now().toString();

    if (this.mode === 'rest' && this.restClient) {
      await this.restClient.set(key, value, { ex: 300 });
    } else if (this.mode === 'tcp' && this.client) {
      await this.client.set(key, value, { EX: 300 });
    }

    console.log(`Invalidated cache for token: ${token}`);
  }

  /**
   * INVALIDATE STATS CACHE
   * Removes the global stats cache
   */
  async invalidateStatsCache(): Promise<void> {
    await this.connect();

    if (this.mode === 'rest' && this.restClient) {
      await this.restClient.del('cache:stats');
    } else if (this.mode === 'tcp' && this.client) {
      await this.client.del('cache:stats');
    }

    console.log('Invalidated global stats cache');
  }

  /**
   * HEALTH CHECK
   * Verifies Redis connection and basic operations
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.connect();

      if (this.mode === 'rest' && this.restClient) {
        await this.restClient.set('health_check', 'ok');
        const result = await this.restClient.get('health_check');
        await this.restClient.del('health_check');
        return result === 'ok';
      } else if (this.mode === 'tcp' && this.client) {
        await this.client.set('health_check', 'ok');
        const result = await this.client.get('health_check');
        await this.client.del('health_check');
        return result === 'ok';
      }

      return false;
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

    if (this.mode === 'rest' && this.restClient) {
      await this.restClient.set(key, value);
    } else if (this.mode === 'tcp' && this.client) {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    await this.connect();

    if (this.mode === 'rest' && this.restClient) {
      return await this.restClient.get(key);
    } else if (this.mode === 'tcp' && this.client) {
      return await this.client.get(key);
    }

    return null;
  }

  async del(key: string): Promise<void> {
    await this.connect();

    if (this.mode === 'rest' && this.restClient) {
      await this.restClient.del(key);
    } else if (this.mode === 'tcp' && this.client) {
      await this.client.del(key);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    await this.connect();

    if (this.mode === 'rest' && this.restClient) {
      return await this.restClient.keys(pattern);
    } else if (this.mode === 'tcp' && this.client) {
      return await this.client.keys(pattern);
    }

    return [];
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
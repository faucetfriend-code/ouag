# Database Connection Guide - Unity Oracle Aggregator

## Overview

This document provides the complete Redis database schema and connection patterns for the Unity Oracle Aggregator. Use this guide to connect your frontend application to the Redis database populated by the n8n workflow.

---

## Connection Configuration

### Environment Variables

```bash
# Redis Connection
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_if_set
REDIS_DB=0

# Optional: Connection Pool Settings
REDIS_MAX_CONNECTIONS=10
REDIS_CONNECT_TIMEOUT=5000
```

### Node.js Connection Example

```javascript
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  database: 0,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
await redisClient.connect();

export default redisClient;
```

---

## Database Schema

### 1. Trading Posts

**Key Pattern:** `post:{postId}`  
**Type:** String (JSON)  
**TTL:** None (persistent)

**Structure:**
```json
{
  "id": "1234567890",
  "user": "crypto_analyst",
  "channel": "btc-analysis",
  "content": "$BTC breaking resistance at $59,500...",
  "timestamp": "2024-11-01T10:30:00.000Z",
  "platform": "discord",
  "tokens": ["BTC"],
  "contentLength": 85,
  "summary": "BTC showing strong upward momentum...",
  "summaryType": "full",
  "needsAI": false,
  "aiAnalysis": {
    "sentiment": "bullish",
    "confidence": 0.85,
    "summary": "BTC breaking resistance with volume confirmation",
    "keyPoints": [
      "Resistance breakout at $59,500",
      "Strong volume confirmation",
      "Next target $62,000"
    ],
    "riskLevel": "medium",
    "priceTargets": ["$59500", "$62000"],
    "timeframe": "short-term"
  },
  "chartData": [58500, 58750, 59000, 59250, 59500]
}
```

**Retrieval:**
```javascript
// Get single post
const post = await redisClient.get('post:1234567890');
const postData = JSON.parse(post);

// Get multiple posts
const postIds = ['1234567890', '1234567891', '1234567892'];
const posts = await Promise.all(
  postIds.map(id => redisClient.get(`post:${id}`))
);
const parsedPosts = posts.map(p => JSON.parse(p));
```

---

### 2. Token Indexes

**Key Pattern:** `token:{TOKEN}:posts`  
**Type:** List  
**TTL:** None (persistent)

**Description:** Stores list of post IDs for each cryptocurrency token.

**Structure:**
```
token:BTC:posts = ["1234567890", "1234567891", "1234567892", ...]
token:ETH:posts = ["2234567890", "2234567891", ...]
token:SOL:posts = ["3234567890", "3234567891", ...]
```

**Retrieval:**
```javascript
// Get all post IDs for BTC
const btcPostIds = await redisClient.lRange('token:BTC:posts', 0, -1);

// Get last 50 posts for BTC
const recentBtcPostIds = await redisClient.lRange('token:BTC:posts', -50, -1);

// Get post count for token
const btcPostCount = await redisClient.lLen('token:BTC:posts');

// Fetch full post data
const btcPosts = await Promise.all(
  btcPostIds.map(async (id) => {
    const post = await redisClient.get(`post:${id}`);
    return JSON.parse(post);
  })
);
```

---

### 3. User Indexes

**Key Pattern:** `user:{username}:posts`  
**Type:** List  
**TTL:** None (persistent)

**Description:** Stores list of post IDs for each analyst/user.

**Structure:**
```
user:crypto_analyst:posts = ["1234567890", "1234567891", ...]
user:btc_trader:posts = ["4234567890", "4234567891", ...]
```

**Retrieval:**
```javascript
// Get all posts by analyst
const analystPostIds = await redisClient.lRange('user:crypto_analyst:posts', 0, -1);

// Get analyst statistics
const postCount = await redisClient.lLen('user:crypto_analyst:posts');

// Fetch analyst's posts
const analystPosts = await Promise.all(
  analystPostIds.map(async (id) => {
    const post = await redisClient.get(`post:${id}`);
    return JSON.parse(post);
  })
);
```

---

### 4. Timeline Index (Sorted by Time)

**Key Pattern:** `timeline:{token}`  
**Type:** Sorted Set  
**TTL:** None (persistent)  
**Score:** Unix timestamp

**Description:** Time-ordered index of posts for each token.

**Structure:**
```
timeline:BTC = {
  "1234567890": 1698841800,  // postId: timestamp
  "1234567891": 1698841900,
  "1234567892": 1698842000
}
```

**Storage (from workflow):**
```javascript
// Add to timeline (done automatically by workflow)
await redisClient.zAdd('timeline:BTC', {
  score: Date.now(),
  value: postId
});
```

**Retrieval:**
```javascript
// Get most recent 50 posts for BTC
const recentPostIds = await redisClient.zRange('timeline:BTC', -50, -1, {
  REV: true  // Reverse order (newest first)
});

// Get posts in time range
const startTime = new Date('2024-11-01T00:00:00Z').getTime();
const endTime = new Date('2024-11-01T23:59:59Z').getTime();
const dayPostIds = await redisClient.zRangeByScore(
  'timeline:BTC',
  startTime,
  endTime
);

// Fetch full posts
const recentPosts = await Promise.all(
  recentPostIds.map(async (id) => {
    const post = await redisClient.get(`post:${id}`);
    return JSON.parse(post);
  })
);
```

---

### 5. Chart Data

**Key Pattern:** `chart:{token}`  
**Type:** String (JSON)  
**TTL:** 3600 seconds (1 hour)

**Description:** Latest chart visualization data for each token.

**Structure:**
```json
{
  "token": "BTC",
  "dataPoints": [58500, 58750, 59000, 59250, 59500],
  "lastUpdated": "2024-11-01T10:30:00.000Z"
}
```

**Retrieval:**
```javascript
// Get chart data for BTC
const chartData = await redisClient.get('chart:BTC');
const chart = JSON.parse(chartData);

// Check if exists
const exists = await redisClient.exists('chart:BTC');

// Get multiple token charts
const tokens = ['BTC', 'ETH', 'SOL'];
const charts = await Promise.all(
  tokens.map(async (token) => {
    const data = await redisClient.get(`chart:${token}`);
    return { token, data: JSON.parse(data) };
  })
);
```

---

### 6. Cache Invalidation Flags

**Key Pattern:** `cache:invalidate:{token}`  
**Type:** String (timestamp)  
**TTL:** 300 seconds (5 minutes)

**Description:** Signals when frontend should refresh token data.

**Structure:**
```
cache:invalidate:BTC = "2024-11-01T10:30:00.000Z"
cache:invalidate:ETH = "2024-11-01T10:32:00.000Z"
```

**Usage:**
```javascript
// Check if cache should be invalidated
const invalidateFlag = await redisClient.get('cache:invalidate:BTC');

if (invalidateFlag) {
  // Timestamp exists - cache is stale, refresh data
  console.log('Cache invalidated at:', invalidateFlag);
  await refreshBTCData();
}

// Subscribe to invalidation events (pub/sub pattern)
const subscriber = redisClient.duplicate();
await subscriber.connect();

await subscriber.subscribe('cache:invalidate:BTC', (message) => {
  console.log('Cache invalidated:', message);
  refreshBTCData();
});
```

---

## Common Query Patterns

### Get Latest Posts for Token

```javascript
async function getTradingPostsByToken(token, limit = 50) {
  try {
    // Get post IDs from timeline (sorted by time)
    const postIds = await redisClient.zRange(
      `timeline:${token}`,
      -limit,
      -1,
      { REV: true }
    );
    
    // Fetch full post data
    const posts = await Promise.all(
      postIds.map(async (id) => {
        const postJson = await redisClient.get(`post:${id}`);
        return postJson ? JSON.parse(postJson) : null;
      })
    );
    
    // Filter out null entries
    return posts.filter(p => p !== null);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// Usage
const btcPosts = await getTradingPostsByToken('BTC', 25);
```

### Get Chart Data for Token

```javascript
async function getChartDataForToken(token) {
  try {
    const chartJson = await redisClient.get(`chart:${token}`);
    
    if (!chartJson) {
      return null;
    }
    
    return JSON.parse(chartJson);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return null;
  }
}

// Usage
const btcChart = await getChartDataForToken('BTC');
console.log(btcChart.dataPoints); // [58500, 58750, 59000, 59250, 59500]
```

### Get Analyst Statistics

```javascript
async function getAnalystStats(username) {
  try {
    const postIds = await redisClient.lRange(
      `user:${username}:posts`,
      0,
      -1
    );
    
    const posts = await Promise.all(
      postIds.map(async (id) => {
        const postJson = await redisClient.get(`post:${id}`);
        return postJson ? JSON.parse(postJson) : null;
      })
    );
    
    const validPosts = posts.filter(p => p !== null);
    
    // Calculate statistics
    const sentimentCounts = validPosts.reduce((acc, post) => {
      const sentiment = post.aiAnalysis?.sentiment || 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});
    
    const avgConfidence = validPosts
      .filter(p => p.aiAnalysis?.confidence)
      .reduce((sum, p) => sum + p.aiAnalysis.confidence, 0) / validPosts.length;
    
    return {
      username,
      totalPosts: validPosts.length,
      sentimentBreakdown: sentimentCounts,
      averageConfidence: avgConfidence,
      tokens: [...new Set(validPosts.flatMap(p => p.tokens))]
    };
  } catch (error) {
    console.error('Error fetching analyst stats:', error);
    return null;
  }
}

// Usage
const stats = await getAnalystStats('crypto_analyst');
console.log(stats);
// {
//   username: 'crypto_analyst',
//   totalPosts: 42,
//   sentimentBreakdown: { bullish: 25, bearish: 10, neutral: 7 },
//   averageConfidence: 0.78,
//   tokens: ['BTC', 'ETH', 'SOL']
// }
```

### Search Posts by Sentiment

```javascript
async function getPostsBySentiment(token, sentiment, limit = 20) {
  try {
    const postIds = await redisClient.zRange(
      `timeline:${token}`,
      0,
      -1,
      { REV: true }
    );
    
    const posts = await Promise.all(
      postIds.map(async (id) => {
        const postJson = await redisClient.get(`post:${id}`);
        return postJson ? JSON.parse(postJson) : null;
      })
    );
    
    return posts
      .filter(p => p && p.aiAnalysis?.sentiment === sentiment)
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

// Usage
const bullishBtcPosts = await getPostsBySentiment('BTC', 'bullish', 10);
```

### Get All Active Tokens

```javascript
async function getActiveTokens() {
  try {
    const keys = await redisClient.keys('token:*:posts');
    const tokens = keys.map(key => key.split(':')[1]);
    
    // Get post counts for each token
    const tokenData = await Promise.all(
      tokens.map(async (token) => {
        const count = await redisClient.lLen(`token:${token}:posts`);
        return { token, postCount: count };
      })
    );
    
    // Sort by post count
    return tokenData.sort((a, b) => b.postCount - a.postCount);
  } catch (error) {
    console.error('Error fetching active tokens:', error);
    return [];
  }
}

// Usage
const tokens = await getActiveTokens();
console.log(tokens);
// [
//   { token: 'BTC', postCount: 156 },
//   { token: 'ETH', postCount: 89 },
//   { token: 'SOL', postCount: 45 }
// ]
```

---

## Real-time Updates with Pub/Sub

### Subscribe to New Posts

```javascript
const subscriber = redisClient.duplicate();
await subscriber.connect();

// Subscribe to all new posts
await subscriber.subscribe('posts:new', (message) => {
  const post = JSON.parse(message);
  console.log('New post:', post);
  updateUI(post);
});

// Subscribe to specific token posts
await subscriber.subscribe('posts:new:BTC', (message) => {
  const post = JSON.parse(message);
  console.log('New BTC post:', post);
  updateBTCFeed(post);
});
```

### Publish Pattern (from workflow)

```javascript
// After storing post, publish notification
await redisClient.publish('posts:new', JSON.stringify(postData));
await redisClient.publish(`posts:new:${token}`, JSON.stringify(postData));
```

---

## Performance Optimization

### Connection Pooling

```javascript
import { createClient } from 'redis';

class RedisPool {
  constructor(maxConnections = 10) {
    this.pool = [];
    this.maxConnections = maxConnections;
    this.inUse = new Set();
  }
  
  async getConnection() {
    let client = this.pool.find(c => !this.inUse.has(c));
    
    if (!client && this.pool.length < this.maxConnections) {
      client = createClient({ url: process.env.REDIS_URL });
      await client.connect();
      this.pool.push(client);
    }
    
    if (client) {
      this.inUse.add(client);
      return client;
    }
    
    throw new Error('Connection pool exhausted');
  }
  
  releaseConnection(client) {
    this.inUse.delete(client);
  }
}

const redisPool = new RedisPool(10);
```

### Caching Strategy

```javascript
// In-memory cache with Redis fallback
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

async function getCachedPost(postId) {
  // Check memory cache first
  const cached = cache.get(postId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  // Fetch from Redis
  const postJson = await redisClient.get(`post:${postId}`);
  const post = JSON.parse(postJson);
  
  // Update cache
  cache.set(postId, {
    data: post,
    timestamp: Date.now()
  });
  
  return post;
}
```

### Batch Operations

```javascript
// Use pipeline for multiple operations
async function batchFetchPosts(postIds) {
  const pipeline = redisClient.multi();
  
  postIds.forEach(id => {
    pipeline.get(`post:${id}`);
  });
  
  const results = await pipeline.exec();
  return results.map(r => r ? JSON.parse(r) : null);
}
```

---

## Error Handling

### Connection Errors

```javascript
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
  // Implement reconnection logic or fallback
});

redisClient.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

redisClient.on('ready', () => {
  console.log('Redis connection ready');
});
```

### Graceful Degradation

```javascript
async function getTradingPostsWithFallback(token, limit = 50) {
  try {
    return await getTradingPostsByToken(token, limit);
  } catch (error) {
    console.error('Redis error, using mock data:', error);
    return getMockTradingPosts(token, limit);
  }
}
```

---

## Health Checks

```javascript
async function redisHealthCheck() {
  try {
    const pingResult = await redisClient.ping();
    const dbSize = await redisClient.dbSize();
    const info = await redisClient.info('memory');
    
    return {
      status: 'healthy',
      ping: pingResult === 'PONG',
      dbSize,
      memory: parseRedisInfo(info)
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

function parseRedisInfo(info) {
  const lines = info.split('\r\n');
  const memory = {};
  lines.forEach(line => {
    if (line.includes(':')) {
      const [key, value] = line.split(':');
      if (key.includes('memory')) {
        memory[key] = value;
      }
    }
  });
  return memory;
}
```

---

## Testing

### Local Development

```javascript
// Connect to local Redis
const testClient = createClient({
  url: 'redis://localhost:6379',
  database: 1  // Use different database for testing
});

await testClient.connect();

// Seed test data
await testClient.set('post:test123', JSON.stringify({
  id: 'test123',
  user: 'test_analyst',
  tokens: ['BTC'],
  content: 'Test post',
  timestamp: new Date().toISOString()
}));

// Run tests
const post = await testClient.get('post:test123');
console.assert(post !== null, 'Post should exist');

// Cleanup
await testClient.flushDb();
await testClient.quit();
```

---

## Migration & Backup

### Backup Strategy

```bash
# Redis RDB snapshot
redis-cli SAVE

# Export specific keys
redis-cli --scan --pattern 'post:*' | xargs redis-cli DUMP > posts_backup.txt

# Restore
cat posts_backup.txt | redis-cli RESTORE
```

### Data Migration

```javascript
async function migrateToNewSchema() {
  const keys = await redisClient.keys('post:*');
  
  for (const key of keys) {
    const post = await redisClient.get(key);
    const parsedPost = JSON.parse(post);
    
    // Add new field
    parsedPost.newField = 'default_value';
    
    // Save updated post
    await redisClient.set(key, JSON.stringify(parsedPost));
  }
  
  console.log(`Migrated ${keys.length} posts`);
}
```

---

## Security Best Practices

1. **Use Redis ACLs** (Redis 6+)
```bash
# Create read-only user for frontend
ACL SETUSER frontend on >password ~post:* ~token:* ~chart:* +get +lrange +zrange
```

2. **Enable TLS** for production
```javascript
const redisClient = createClient({
  url: 'rediss://your-redis-host:6379',  // Note: rediss:// for TLS
  socket: {
    tls: true,
    rejectUnauthorized: true
  }
});
```

3. **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true
});

app.use('/api/', apiLimiter);
```

---

## Troubleshooting

### Common Issues

**Issue:** Posts not appearing in frontend  
**Solution:** Check cache invalidation and timeline indexes

```javascript
// Debug timeline
const btcTimeline = await redisClient.zRange('timeline:BTC', 0, -1);
console.log('BTC timeline post IDs:', btcTimeline);

// Check if post exists
const postExists = await redisClient.exists('post:123456');
console.log('Post exists:', postExists);
```

**Issue:** Stale chart data  
**Solution:** Check TTL and update mechanism

```javascript
// Check chart TTL
const ttl = await redisClient.ttl('chart:BTC');
console.log('Chart TTL remaining:', ttl, 'seconds');

// Force refresh
await redisClient.del('chart:BTC');
```

**Issue:** Memory usage growing  
**Solution:** Implement data retention policy

```javascript
// Keep only last 1000 posts per token
async function pruneOldPosts(token, keepCount = 1000) {
  const postIds = await redisClient.lRange(`token:${token}:posts`, 0, -1);
  
  if (postIds.length > keepCount) {
    const toDelete = postIds.slice(0, postIds.length - keepCount);
    
    for (const id of toDelete) {
      await redisClient.del(`post:${id}`);
    }
    
    await redisClient.lTrim(`token:${token}:posts`, -keepCount, -1);
    await redisClient.zRemRangeByRank(`timeline:${token}`, 0, -(keepCount + 1));
  }
}
```

---

## Summary

This database schema provides:
- **Fast queries** via indexes (token, user, timeline)
- **Structured data** with JSON storage
- **Real-time updates** via pub/sub
- **Automatic cleanup** with TTL on cache flags
- **Scalability** with Redis clustering support

For additional support, refer to:
- [Redis Documentation](https://redis.io/documentation)
- [Redis Node.js Client](https://github.com/redis/node-redis)
- n8n Workflow: `unity-oracle-workflow.json`

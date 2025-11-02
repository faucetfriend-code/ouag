# Redis Database Integration

This document describes the Redis integration for the Unity Oracle Aggregator, providing fast, scalable data storage for analyst posts, chart data, and analysis summaries.

## Overview

Redis is used as the primary database for:
- **Trading Posts**: Analyst comments and analysis
- **Chart Data**: Price data points for visualization
- **Real-time Updates**: Cache invalidation and live data
- **Analytics**: Post statistics and user activity

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Webhook API   │───▶│   Workflow       │───▶│   Redis DB      │
│                 │    │   Processing     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │◀───│   API Routes     │◀───│   Data Fetching │
│   (Next.js)     │    │   (SSR/SSG)     │    │   Functions      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Data Structures

### Trading Posts
```redis
Key: post:{postId}
Value: JSON string of ProcessedPost
```

### Token Indexes
```redis
Key: token:{token}:posts
Type: Set of post IDs
```

### User Indexes
```redis
Key: user:{username}:posts
Type: Set of post IDs
```

### Timeline (Sorted by Time)
```redis
Key: timeline:{token}
Type: Sorted Set (score: timestamp, value: postId)
```

### Chart Data
```redis
Key: chart:{token}
Value: JSON string with dataPoints array
```

### Cache Invalidation
```redis
Key: cache:invalidate:{token}
Type: String with timestamp (expires in 5 minutes)
```

## API Endpoints

### Webhook Processing
```
POST /api/webhooks/[platform]
```
- Processes incoming webhooks
- Stores data in Redis
- Triggers cache invalidation

### External Analysis Updates
```
PUT /api/posts/{postId}/analysis
```
- Updates AI analysis for existing posts
- Used by external summary services

### Data Fetching (Internal)
- `getTradingPostsByToken(token)` - Get posts for a token
- `getChartDataForToken(token)` - Get chart data
- `getAnalystStats()` - Get platform statistics

## Setup Instructions

### 1. Install Redis

**Windows (using Chocolatey):**
```bash
choco install redis-64
redis-server
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Local Installation:**
Download from [redis.io](https://redis.io/download)

### 2. Environment Variables

Add to `.env.local`:
```env
REDIS_URL=redis://localhost:6379
ANALYSIS_UPDATE_SECRET=your_secret_token
```

### 3. Initialize Database

```bash
# Initialize with mock data
npm run redis:init

# Clear and reinitialize
npm run redis:clear && npm run redis:init
```

### 4. Health Check

The application will automatically check Redis health on startup. Monitor logs for connection status.

## Data Operations

### Storing Posts

```javascript
await redisService.storePost(processedPost);
// Automatically creates indexes and timeline entries
```

### Fetching Data

```javascript
// Get posts for BTC
const btcPosts = await getTradingPostsByToken('BTC');

// Get chart data
const chartData = await getChartDataForToken('BTC');

// Get platform stats
const stats = await getAnalystStats();
```

### External Analysis Updates

```bash
# Update analysis for a post
curl -X PUT http://localhost:3000/api/posts/123/analysis \
  -H "Authorization: Bearer your_secret_token" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "BTC showing strong bullish momentum",
    "sentiment": "bullish",
    "confidence": 0.85,
    "keyPoints": ["Resistance breakout", "Volume confirmation"]
  }'
```

## Performance Optimization

### Indexing Strategy
- **Token Indexes**: Fast lookup by cryptocurrency
- **User Indexes**: Track analyst activity
- **Timeline Indexes**: Sorted by timestamp for recent posts
- **Cache Invalidation**: 5-minute expiry for real-time updates

### Query Patterns
- **Recent Posts**: `ZREVRANGE timeline:{token} 0 49`
- **Token Posts**: `SMEMBERS token:{token}:posts`
- **User Posts**: `SMEMBERS user:{username}:posts`

### Memory Management
- Automatic cleanup of expired cache keys
- Efficient JSON storage for complex objects
- Sorted sets for time-based queries

## Monitoring & Maintenance

### Health Checks
```javascript
const isHealthy = await redisService.healthCheck();
```

### Statistics
- Total posts: `DBSIZE` command
- Memory usage: `INFO memory`
- Connected clients: `INFO clients`

### Backup & Recovery
```bash
# Create backup
redis-cli SAVE

# Restore from dump.rdb
# (Redis automatic recovery on restart)
```

## Scaling Considerations

### Read Replicas
For high-traffic applications, set up Redis replicas for read operations.

### Clustering
Use Redis Cluster for horizontal scaling across multiple nodes.

### Persistence
Configure RDB/AOF persistence based on data criticality.

## Troubleshooting

### Connection Issues
- Verify Redis is running: `redis-cli ping`
- Check connection URL in environment variables
- Ensure firewall allows port 6379

### Data Not Appearing
- Check Redis logs for errors
- Verify data was stored: `redis-cli KEYS "*"`
- Test API endpoints directly

### Performance Issues
- Monitor slow queries with `SLOWLOG`
- Check memory usage with `INFO memory`
- Consider adding indexes for new query patterns

## Migration from Mock Data

The system automatically falls back to mock data if Redis is unavailable, ensuring the application remains functional during database issues.

## Security

- Use strong `ANALYSIS_UPDATE_SECRET` for external API access
- Consider Redis ACLs for production deployments
- Encrypt sensitive data before storage
- Implement rate limiting on API endpoints

## Development Workflow

1. **Local Development**: Use `redis:6379` with Docker
2. **Testing**: Run `npm run redis:init` to seed test data
3. **Production**: Configure managed Redis (AWS ElastiCache, etc.)
4. **Monitoring**: Set up alerts for connection failures and performance metrics</content>
</xai:function_call">REDIS_README.md
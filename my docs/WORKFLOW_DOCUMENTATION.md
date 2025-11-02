# Unity Oracle Aggregator - Workflow Documentation

## Overview

This n8n workflow processes analyst posts from Discord, Twitter, and manual submissions, generates AI-powered summaries and analysis, extracts chart data, and stores everything in Redis for fast retrieval by the frontend application.

**Workflow File:** `unity-oracle-workflow.json`

---

## Architecture Components

### Flow Diagram

```
Webhooks → Parse Data → Route by Length → Process → Extract Chart → Store Redis → Respond
   ↓           ↓              ↓              ↓            ↓              ↓
Discord    Extract       Short/Long      AI Agent    Price Data     Multiple      Success
Twitter    Tokens        Switch          Summary     Extraction     Indexes       Response
Manual     Platform                      Sentiment                  Timeline
           Normalize                     Analysis                   Cache
```

---

## Node Breakdown

### 1. WEBHOOK INGESTION (Nodes 1-3)

#### Discord Webhook
- **Node ID:** `webhook-discord`
- **Type:** `n8n-nodes-base.webhook`
- **Path:** `/webhook/discord`
- **Method:** POST
- **Purpose:** Receives Discord message events from analyst channels

**Expected Payload:**
```json
{
  "id": "1234567890123456789",
  "content": "$BTC breaking key resistance at $59,500...",
  "author": {
    "username": "crypto_analyst",
    "id": "987654321"
  },
  "timestamp": "2024-11-01T10:30:00.000Z",
  "channel_id": "btc-analysis"
}
```

**Configuration:**
- Response Mode: `responseNode` (waits for workflow completion)
- Webhook ID: `discord-analyst-posts`

#### Twitter Webhook
- **Node ID:** `webhook-twitter`
- **Type:** `n8n-nodes-base.webhook`
- **Path:** `/webhook/twitter`
- **Method:** POST
- **Purpose:** Receives Twitter Account Activity API events

**Expected Payload:**
```json
{
  "id": "1234567890123456789",
  "text": "$ETH breaking out of consolidation...",
  "created_at": "2024-11-01T10:30:00.000Z",
  "author_id": "1111111111111111111",
  "author": {
    "username": "eth_analyst",
    "name": "ETH Analyst"
  }
}
```

#### Manual Submission Webhook
- **Node ID:** `webhook-manual`
- **Type:** `n8n-nodes-base.webhook`
- **Path:** `/webhook/manual`
- **Method:** POST
- **Purpose:** Direct API submissions from analysts

**Expected Payload:**
```json
{
  "analyst_id": "analyst_123",
  "token": "BTC",
  "content": "BTC analysis content here...",
  "timestamp": "2024-11-01T10:30:00.000Z",
  "platform": "manual"
}
```

---

### 2. DATA PARSING (Node 4)

#### Parse & Extract Tokens
- **Node ID:** `code-parser`
- **Type:** `n8n-nodes-base.code`
- **Language:** JavaScript
- **Purpose:** Normalizes platform-specific data and extracts cryptocurrency tokens

**Process:**
1. Detects platform (Discord/Twitter/Manual)
2. Parses platform-specific fields into standardized format
3. Extracts tokens using regex: `/\$([A-Z]{2,10})\b/g`
4. Fallback: Searches for common tokens (BTC, ETH, SOL, etc.)
5. Measures content length for routing

**Output Schema:**
```javascript
{
  id: string,              // Unique post ID
  user: string,            // Analyst username
  channel: string,         // Channel/source
  content: string,         // Full post content
  timestamp: string,       // ISO 8601 timestamp
  platform: string,        // 'discord' | 'twitter' | 'manual'
  tokens: string[],        // ['BTC', 'ETH', ...]
  contentLength: number    // Character count
}
```

**Token Extraction Logic:**
```javascript
// Primary: $TOKEN format
const tokenRegex = /\$([A-Z]{2,10})\b/g;
const tokenMatches = content.match(tokenRegex);

// Fallback: Search common tokens
const commonTokens = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'DOT', 'LINK', 'UNI', 'AAVE'];

// Default: BTC if no tokens found
if (tokens.length === 0) {
  tokens = ['BTC'];
}
```

---

### 3. CONTENT ROUTING (Node 5)

#### Route by Content Length
- **Node ID:** `switch-content-length`
- **Type:** `n8n-nodes-base.switch`
- **Purpose:** Routes posts based on length for optimal processing

**Rules:**
1. **Short Content** (≤280 chars) → Use full content
2. **Long Content** (>280 chars) → Send to AI for summarization

**Configuration:**
```javascript
// Rule 1: Short Content
conditions: contentLength <= 280
output: "Short Content"

// Rule 2: Long Content
conditions: contentLength > 280
output: "Long Content - Needs AI"
```

**Rationale:** Short posts (tweet-length) can be displayed fully. Long posts need summarization for UI readability.

---

### 4. SHORT CONTENT PATH (Node 6)

#### Use Full Content
- **Node ID:** `set-short-content`
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Marks short posts to use complete content

**Assignments:**
```javascript
summary: $json.content           // Use full content as summary
summaryType: "full"              // Mark as full content
needsAI: false                   // Skip AI processing
```

---

### 5. LONG CONTENT PATH (Nodes 7-9)

#### Flag for AI Processing
- **Node ID:** `set-needs-ai`
- **Type:** `n8n-nodes-base.set`
- **Purpose:** Flags long posts for AI analysis

**Assignment:**
```javascript
needsAI: true
```

#### AI Analysis Agent
- **Node ID:** `ai-agent`
- **Type:** `@n8n/n8n-nodes-langchain.agent`
- **Purpose:** Generates structured analysis using OpenAI GPT-4

**Prompt Template:**
```
Analyze this cryptocurrency trading post and provide a structured analysis.

**Post Content:** {{ $json.content }}
**Token:** {{ $json.tokens[0] }}
**Analyst:** {{ $json.user }}
**Platform:** {{ $json.platform }}

**Output Format (JSON):**
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0.0-1.0,
  "summary": "2-3 sentence concise summary",
  "keyPoints": ["point1", "point2", "point3"],
  "riskLevel": "low|medium|high",
  "priceTargets": ["$58000", "$62000"] or null,
  "timeframe": "short-term|medium-term|long-term" or null
}

Return ONLY valid JSON.
```

**System Message:**
```
You are an expert cryptocurrency analyst. Analyze trading posts and provide 
structured, accurate insights. Always respond with valid JSON only.
```

**Configuration:**
- Temperature: `0.3` (low for consistency)
- Max Tokens: `1000`
- Model: Connected via `OpenAI Chat Model` node

#### OpenAI Chat Model
- **Node ID:** `openai-model`
- **Type:** `@n8n/n8n-nodes-langchain.lmChatOpenAi`
- **Purpose:** Provides GPT-4o model for AI agent

**Settings:**
- Model: `gpt-4o-2024-08-06`
- Temperature: `0.3`
- Max Tokens: `1000`

**Connection:** Links to AI Agent via `ai_languageModel` connection type

#### Parse AI Response
- **Node ID:** `code-parse-ai`
- **Type:** `n8n-nodes-base.code`
- **Purpose:** Validates and normalizes AI output

**Process:**
1. Extract JSON from AI response
2. Validate sentiment (bullish/bearish/neutral)
3. Clamp confidence (0-1)
4. Truncate key points (max 5)
5. Validate risk level and timeframe
6. Merge with original post data

**Validation Rules:**
```javascript
// Sentiment validation
sentiment: ['bullish', 'bearish', 'neutral'].includes(parsed.sentiment)
  ? parsed.sentiment : 'neutral'

// Confidence validation
confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))

// Key points limit
keyPoints: Array.isArray(parsed.keyPoints)
  ? parsed.keyPoints.slice(0, 5) : []
```

**Output:**
```javascript
{
  ...originalPost,
  aiAnalysis: {
    sentiment,
    confidence,
    summary,
    keyPoints,
    riskLevel,
    priceTargets,
    timeframe
  },
  summary: aiAnalysis.summary,
  summaryType: 'ai'
}
```

---

### 6. MERGE PATHS (Node 10)

#### Merge Short & AI Content
- **Node ID:** `merge-content`
- **Type:** `n8n-nodes-base.merge`
- **Purpose:** Combines both processing paths

**Configuration:**
- Mode: `combine`
- Combine By: `combineAll`
- Input 1: Short content (full)
- Input 2: AI-processed content (summarized)

**Output:** Unified stream with both types of posts

---

### 7. CHART DATA EXTRACTION (Node 11)

#### Extract Chart Data
- **Node ID:** `code-chart-extractor`
- **Type:** `n8n-nodes-base.code`
- **Purpose:** Generates 5-point chart data arrays

**Price Detection Regex:**
```javascript
// Matches: $58,000 | $58000 | 58k | 58K | $58.5k
const priceRegex = /\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)[kK]?/g;
```

**Process:**
1. Extract all price mentions from content
2. Convert 'k' suffix to thousands (58k → 58000)
3. Filter reasonable crypto prices (100-1,000,000)
4. If ≥5 prices: Use first 5
5. If <5 prices: Interpolate between min/max
6. If no prices: Generate synthetic data based on sentiment

**Synthetic Data Generation:**
```javascript
const basePrice = {
  'BTC': 58000,
  'ETH': 2800,
  'SOL': 95,
  'default': 1000
}[token];

const trend = sentiment === 'bullish' ? 1.02 : 
              sentiment === 'bearish' ? 0.98 : 1.0;

chartData = [
  basePrice * trend^-2,
  basePrice * trend^-1,
  basePrice,
  basePrice * trend^1,
  basePrice * trend^2
];
```

**Output:**
```javascript
{
  ...post,
  chartData: [58500, 58750, 59000, 59250, 59500]  // 5 data points
}
```

---

### 8. REDIS STORAGE (Nodes 12-16)

#### Store Post in Redis
- **Node ID:** `redis-store-post`
- **Type:** `n8n-nodes-base.redis`
- **Operation:** `set`
- **Purpose:** Stores complete post data

**Key Pattern:** `post:{postId}`  
**Value:** Complete post JSON

```javascript
await redis.set(
  `post:${postId}`,
  JSON.stringify(postData)
);
```

#### Update Token Index
- **Node ID:** `redis-token-index`
- **Type:** `n8n-nodes-base.redis`
- **Operation:** `push`
- **Purpose:** Adds post to token-specific list

**Key Pattern:** `token:{TOKEN}:posts`  
**Value:** Post ID

```javascript
await redis.lPush(
  `token:${token}:posts`,
  postId
);
```

#### Update User Index
- **Node ID:** `redis-user-index`
- **Type:** `n8n-nodes-base.redis`
- **Operation:** `push`
- **Purpose:** Adds post to user-specific list

**Key Pattern:** `user:{username}:posts`  
**Value:** Post ID

```javascript
await redis.lPush(
  `user:${username}:posts`,
  postId
);
```

#### Update Chart Data
- **Node ID:** `redis-chart-data`
- **Type:** `n8n-nodes-base.redis`
- **Operation:** `set`
- **Purpose:** Stores latest chart visualization data

**Key Pattern:** `chart:{TOKEN}`  
**Value:** Chart data JSON  
**TTL:** 3600 seconds (1 hour)

```javascript
await redis.set(
  `chart:${token}`,
  JSON.stringify({
    token,
    dataPoints: chartData,
    lastUpdated: timestamp
  }),
  { EX: 3600 }  // Expire after 1 hour
);
```

#### Invalidate Cache
- **Node ID:** `redis-cache-invalidate`
- **Type:** `n8n-nodes-base.redis`
- **Operation:** `set`
- **Purpose:** Signals frontend to refresh token data

**Key Pattern:** `cache:invalidate:{TOKEN}`  
**Value:** Timestamp  
**TTL:** 300 seconds (5 minutes)

```javascript
await redis.set(
  `cache:invalidate:${token}`,
  timestamp,
  { EX: 300 }  // Expire after 5 minutes
);
```

---

### 9. RESPONSE (Node 17)

#### Respond to Webhook
- **Node ID:** `respond-webhook`
- **Type:** `n8n-nodes-base.respondToWebhook`
- **Purpose:** Returns success confirmation

**Response:**
```json
{
  "success": true,
  "postId": "1234567890",
  "token": "BTC",
  "processed": true,
  "timestamp": "2024-11-01T10:30:00.000Z"
}
```

**Status Code:** 200 OK

---

## Documentation Sections (Sticky Notes)

### Sticky Note 1: Webhook Ingestion
- **Position:** Top-left
- **Content:** Overview of webhook endpoints

### Sticky Note 2: Data Parsing
- **Position:** After webhooks
- **Content:** Token extraction and normalization

### Sticky Note 3: Content Routing
- **Position:** After parsing
- **Content:** Length-based routing logic

### Sticky Note 4: AI Processing
- **Position:** AI section
- **Content:** OpenAI analysis features

### Sticky Note 5: Chart Data
- **Position:** Chart section
- **Content:** Price extraction and generation

### Sticky Note 6: Redis Storage
- **Position:** Storage section
- **Content:** Database key patterns

---

## Workflow Configuration

### Environment Variables Required

```bash
# OpenAI API
OPENAI_API_KEY=sk-...

# Redis Connection
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password_if_set

# Webhook Security (optional)
WEBHOOK_SECRET=your_secret_token
```

### Credentials Setup

1. **OpenAI API:**
   - Create credential in n8n
   - Add API key from OpenAI dashboard
   - Connect to `OpenAI Chat Model` node

2. **Redis:**
   - Create credential in n8n
   - Add host, port, password
   - Connect to all Redis nodes (12-16)

---

## Testing

### Test Discord Webhook

```bash
curl -X POST http://localhost:5678/webhook/discord \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test123",
    "content": "$BTC breaking resistance at $59,500 with strong volume",
    "author": {
      "username": "test_analyst",
      "id": "999"
    },
    "timestamp": "2024-11-01T10:30:00Z",
    "channel_id": "test-channel"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "postId": "test123",
  "token": "BTC",
  "processed": true,
  "timestamp": "2024-11-01T10:30:00.000Z"
}
```

### Verify Redis Storage

```bash
# Check post was stored
redis-cli GET post:test123

# Check token index
redis-cli LRANGE token:BTC:posts 0 -1

# Check chart data
redis-cli GET chart:BTC

# Check cache invalidation
redis-cli GET cache:invalidate:BTC
```

---

## Error Handling

### AI Parsing Failures
- **Handled In:** Parse AI Response node
- **Fallback:** Default analysis with neutral sentiment

```javascript
try {
  const parsed = JSON.parse(aiResponse);
  // Validate and use
} catch (error) {
  // Use fallback values
  analysis = {
    sentiment: 'neutral',
    confidence: 0.5,
    summary: 'Analysis generated with limited data'
  };
}
```

### Redis Connection Issues
- **Handled In:** All Redis nodes
- **Retry Logic:** Built into Redis client
- **Monitoring:** Check workflow execution logs

### Invalid Webhook Data
- **Handled In:** Parse & Extract Tokens node
- **Fallback:** Uses default values

```javascript
// Safe parsing with defaults
const user = item.author?.username || 'unknown';
const content = item.content || '';
```

---

## Performance Considerations

### AI Rate Limits
- **OpenAI Limit:** ~10,000 requests/minute (tier dependent)
- **Workflow Rate:** ~1-5 posts/second
- **Optimization:** Only long posts trigger AI

### Redis Performance
- **Expected Load:** 100-1000 posts/day
- **Memory Usage:** ~1KB per post × retention count
- **Optimization:** TTL on chart data and cache flags

### Execution Time
- **Short Posts:** ~2-3 seconds (no AI)
- **Long Posts:** ~5-10 seconds (with AI)
- **Bottleneck:** OpenAI API response time

---

## Monitoring & Debugging

### Key Metrics to Track

1. **Webhook Success Rate**
   - Monitor failed webhook calls
   - Check response times

2. **AI Processing Rate**
   - Track AI call frequency
   - Monitor API costs

3. **Redis Storage**
   - Database size growth
   - Memory usage
   - Connection pool health

### Debug Mode

Enable detailed logging:

```javascript
// In code nodes, add console.log
console.log('Parsed data:', parsedData);
console.log('AI response:', aiResponse);
console.log('Chart data:', chartData);
```

View logs in n8n execution history.

---

## Scaling & Extensions

### Future Enhancements

1. **Multi-Token Posts**
   - Handle posts mentioning multiple tokens
   - Store in multiple token indexes

2. **Advanced Sentiment Analysis**
   - Fine-tune GPT-4 on crypto data
   - Add market correlation analysis

3. **Real-time Notifications**
   - Redis Pub/Sub for live updates
   - WebSocket integration

4. **Content Classification**
   - Distinguish: Analyst Post / Tool Review / News / Airdrop
   - Route to specialized processing

5. **Historical Analysis**
   - Trend analysis over time
   - Accuracy tracking vs price movements

### Horizontal Scaling

- **Multiple Webhook Instances:** Load balancer
- **Redis Clustering:** Horizontal data sharding
- **AI Queue System:** Process posts asynchronously

---

## Maintenance

### Regular Tasks

1. **Daily:**
   - Monitor execution logs
   - Check error rates

2. **Weekly:**
   - Review AI analysis quality
   - Audit Redis memory usage

3. **Monthly:**
   - Prune old posts (retention policy)
   - Update AI prompts based on feedback

### Data Retention

```javascript
// Suggested retention: Keep last 1000 posts per token
// Run as separate workflow or cron job

async function pruneOldPosts(token, keepCount = 1000) {
  const postIds = await redis.lRange(`token:${token}:posts`, 0, -1);
  
  if (postIds.length > keepCount) {
    const toDelete = postIds.slice(0, postIds.length - keepCount);
    
    // Delete old posts
    for (const id of toDelete) {
      await redis.del(`post:${id}`);
    }
    
    // Trim list
    await redis.lTrim(`token:${token}:posts`, -keepCount, -1);
  }
}
```

---

## Support & Resources

**Documentation:**
- n8n Docs: https://docs.n8n.io
- OpenAI API: https://platform.openai.com/docs
- Redis Commands: https://redis.io/commands

**Workflow Files:**
- Main Workflow: `unity-oracle-workflow.json`
- Database Schema: `DATABASE_CONNECTION.md`
- Original Docs: `WORKFLOW_README.md`, `SUMINT.md`, `WEBHOOK.md`

**Contact:**
- For workflow issues: Check n8n execution logs
- For AI problems: Review OpenAI API status
- For Redis issues: Run `redis-cli INFO` for diagnostics

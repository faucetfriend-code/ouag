# Database Architecture

## Overview

The Unity Oracle Aggregator uses a **multi-database architecture** with separate Redis databases and n8n workflows for different feature areas. This separation provides:

- **Scalability**: Each feature can scale independently
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Different update frequencies and data retention policies per feature
- **Reliability**: Issues in one database don't affect others

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Unity Oracle Aggregator                   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┬─────────────────────┐
        │                     │                     │                     │
        ▼                     ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Analyst    │    │    Tools     │    │     News     │    │   Airdrops   │
│   Database   │    │   Database   │    │   Database   │    │   Database   │
│   (Redis)    │    │   (Redis)    │    │   (Redis)    │    │   (Redis)    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
        ▲                     ▲                     ▲                     ▲
        │                     │                     │                     │
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Analyst    │    │    Tools     │    │     News     │    │   Airdrops   │
│   Workflow   │    │   Workflow   │    │   Workflow   │    │   Workflow   │
│    (n8n)     │    │    (n8n)     │    │    (n8n)     │    │    (n8n)     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
        ▲                     ▲                     ▲                     ▲
        │                     │                     │                     │
  ┌───────────┐         ┌───────────┐        ┌───────────┐        ┌───────────┐
  │ Discord/  │         │ Exchange  │        │   News    │        │  Project  │
  │  Twitter  │         │   APIs    │        │   APIs    │        │  Sources  │
  └───────────┘         └───────────┘        └───────────┘        └───────────┘
```

---

## Database 1: Analyst Insights Database

### Purpose
Stores analyst insights, trading posts, and sentiment analysis from expert crypto analysts.

### Status
✅ **IMPLEMENTED** - Currently active and connected

### Data Sources
- Discord channels (analyst discussions)
- Twitter feeds (analyst tweets)
- Manual analyst submissions

### n8n Workflow
- **Status**: ✅ Active
- **Location**: See `WORKFLOW_DOCUMENTATION.md`
- **Update Frequency**: Real-time (webhook-triggered)
- **Processing Pipeline**:
  1. Webhook receives data from Discord/Twitter
  2. Parse and extract analyst information
  3. AI sentiment analysis (OpenAI)
  4. Store in Redis with proper indexing
  5. Update timelines and token-specific posts

### Redis Schema
See `DATABASE_CONNECTION.md` for detailed schema documentation.

**Key Patterns:**
```
post:{postId}                    # Individual analyst post
token:{TOKEN}:posts             # All posts for a specific token
timeline:{token}                # Timeline of posts by recency
analyst:{username}:posts        # All posts by an analyst
sentiment:{sentiment}:posts     # Posts by sentiment (bullish/bearish)
```

### Application Integration
- **Data Layer**: `lib/analystDataSource.ts`
- **Pages**:
  - `/analysts` - Analyst directory
  - `/analysts/[token]` - Token-specific analysis
  - `/analysts/[token]/summary` - AI-generated summaries
- **Toggle**: Data source can be switched between mock/Redis via cookie preference

---

## Database 2: Trading Tools Database

### Purpose
Stores market data, funding rates, volatility metrics, and liquidation data.

### Status
🚧 **PLANNED** - Currently using mock data

### Data Sources
- Exchange APIs (Binance, Bybit, OKX, etc.)
- DeFi protocols
- On-chain data aggregators
- Market data providers (CoinGecko, CoinMarketCap)

### n8n Workflow (To Be Created)
- **Status**: 📝 Not yet implemented
- **Proposed Update Frequency**:
  - Top Movers: Every 5 minutes
  - Funding Rates: Every 15 minutes
  - Volatility: Every 1 hour
  - Liquidations: Real-time webhooks
- **Processing Pipeline**:
  1. Scheduled HTTP requests to exchange APIs
  2. Data normalization and aggregation
  3. Calculate derived metrics (volatility, trends)
  4. Store in Redis with TTL
  5. Trigger alerts for significant changes

### Redis Schema (Proposed)
```
# Top Movers
topmovers:timestamp:{ts}           # Snapshot of top movers
topmovers:latest                   # Most recent top movers data
token:{symbol}:price               # Current price
token:{symbol}:24h                 # 24h change data

# Funding Rates
funding:{exchange}:{token}         # Current funding rate
funding:history:{token}:{ts}       # Historical funding rates
funding:alerts:{token}             # Alert thresholds

# Volatility
volatility:{token}:7d              # 7-day volatility
volatility:{token}:30d             # 30-day volatility
volatility:{token}:history         # Historical volatility data

# Liquidations
liquidations:24h:{token}           # 24h liquidation data
liquidations:history:{token}       # Historical liquidations
```

### Application Integration
- **Data Layer**: `lib/toolsData.ts` (currently mock)
- **Pages**: `/tools` - Trading tools dashboard
- **Components**: Top Movers table, Funding Rates cards

---

## Database 3: News Feed Database

### Purpose
Aggregates cryptocurrency news from multiple sources with sentiment analysis.

### Status
🚧 **PLANNED** - Currently using mock data

### Data Sources
- CoinDesk RSS feed
- CoinTelegraph API
- Crypto news aggregators
- Twitter breaking news
- Reddit crypto communities

### n8n Workflow (To Be Created)
- **Status**: 📝 Not yet implemented
- **Proposed Update Frequency**: Every 15 minutes
- **Processing Pipeline**:
  1. Fetch from multiple news APIs/RSS feeds
  2. Deduplicate articles (similar titles/content)
  3. AI-powered categorization (Market, Technology, Regulation, DeFi, NFT)
  4. Sentiment analysis
  5. Extract relevant tokens mentioned
  6. Store in Redis with full-text search capability

### Redis Schema (Proposed)
```
# News Articles
news:{articleId}                   # Individual article with full details
news:category:{category}           # Articles by category
news:sentiment:{sentiment}         # Articles by sentiment
news:token:{token}                 # Articles mentioning a token
news:latest                        # Sorted set by publish date
news:tags:{tag}                    # Articles by tag

# Article Details Structure
{
  id: string
  title: string
  summary: string
  content: string
  author: string
  source: string
  sourceUrl: string
  category: Market|Technology|Regulation|DeFi|NFT|General
  tags: string[]
  publishedAt: timestamp
  sentiment: bullish|bearish|neutral
  tokensmentioned: string[]
}
```

### Application Integration
- **Data Layer**: `lib/newsData.ts` (currently mock)
- **Pages**: `/news` - News feed with filtering
- **Features**: Category filtering, sentiment badges, search

---

## Database 4: Airdrop Guide Database

### Purpose
Tracks active, upcoming, and ended cryptocurrency airdrops with eligibility criteria.

### Status
🚧 **PLANNED** - Currently using mock data

### Data Sources
- Project announcements (Twitter, Discord)
- Airdrop aggregator platforms
- Manual curation
- Community submissions
- On-chain snapshot tracking

### n8n Workflow (To Be Created)
- **Status**: 📝 Not yet implemented
- **Proposed Update Frequency**:
  - New airdrops: Real-time monitoring
  - Status updates: Every 1 hour
  - Verification checks: Daily
- **Processing Pipeline**:
  1. Monitor social media for airdrop announcements
  2. Scrape airdrop aggregator sites
  3. Verify project authenticity (anti-scam)
  4. Extract eligibility criteria and requirements
  5. Track snapshot dates and claim deadlines
  6. Update status (active → upcoming → ended)
  7. Store in Redis with comprehensive metadata

### Redis Schema (Proposed)
```
# Airdrops
airdrop:{airdropId}                # Full airdrop details
airdrop:status:{status}            # Airdrops by status (active/upcoming/ended)
airdrop:type:{type}                # By type (snapshot/task-based/holder/etc.)
airdrop:verified                   # Verified airdrops only
airdrop:project:{project}          # By project name
airdrop:deadline:{date}            # Sorted by claim deadline

# Airdrop Details Structure
{
  id: string
  project: string
  token: string
  tokenSymbol: string
  description: string
  totalValue: string
  status: active|upcoming|ended|claimed
  type: snapshot|task-based|holder|referral|testnet
  startDate: timestamp
  endDate: timestamp
  claimDeadline: timestamp
  requirements: string[]
  eligibilityCriteria: string
  steps: string[]
  estimatedReward: string
  website: string
  socialLinks: { twitter, discord, telegram }
  verified: boolean
  scamScore: number (0-100)
}
```

### Application Integration
- **Data Layer**: `lib/airdropsData.ts` (currently mock)
- **Pages**: `/airdrops` - Airdrop guide with active/upcoming sections
- **Features**: Status filtering, verification badges, deadline tracking

---

## Data Source Toggle System

### Implementation
The analyst database supports toggling between mock data and real Redis data through a cookie-based preference system.

### Components
- **Cookie Name**: `analyst_data_source`
- **Values**: `mock` | `redis`
- **Storage**: Client-side cookie (365-day expiration)
- **Component**: `DataSourceToggle.tsx` on home page

### How It Works
1. User clicks toggle on home page
2. Cookie `analyst_data_source` is set to `mock` or `redis`
3. Server-side pages read cookie via `getDataSourcePreference()`
4. Data layer functions route to mock or Redis implementations
5. Page reloads to apply new data source

### Code References
- `lib/analystDataSource.ts:23` - `getDataSourcePreference()`
- `lib/analystDataSource.ts:32` - `shouldUseMockData()`
- `components/DataSourceToggle.tsx` - Toggle UI component

### Future Toggle Support
Currently, only the **Analyst Database** supports toggling. Tools, News, and Airdrops will always use their respective databases once implemented (no mock/real toggle needed).

---

## Environment Configuration

### Environment Variables

```bash
# Analyst Database (Current)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
NEXT_PUBLIC_USE_MOCK_DATA=false

# Tools Database (Future)
REDIS_TOOLS_HOST=your-tools-redis-host
REDIS_TOOLS_PORT=6379
REDIS_TOOLS_PASSWORD=your-tools-redis-password

# News Database (Future)
REDIS_NEWS_HOST=your-news-redis-host
REDIS_NEWS_PORT=6379
REDIS_NEWS_PASSWORD=your-news-redis-password

# Airdrops Database (Future)
REDIS_AIRDROPS_HOST=your-airdrops-redis-host
REDIS_AIRDROPS_PORT=6379
REDIS_AIRDROPS_PASSWORD=your-airdrops-redis-password
```

---

## Implementation Roadmap

### Phase 1: ✅ COMPLETE
- [x] Analyst Database setup
- [x] Analyst n8n workflow
- [x] Data source toggle
- [x] Mock data infrastructure for all features
- [x] UI pages for all features

### Phase 2: 🚧 IN PROGRESS
- [ ] Design Tools database schema
- [ ] Create Tools n8n workflow
- [ ] Connect Tools page to database
- [ ] Test and validate data accuracy

### Phase 3: 📝 PLANNED
- [ ] Design News database schema
- [ ] Create News n8n workflow
- [ ] Implement full-text search
- [ ] Connect News page to database

### Phase 4: 📝 PLANNED
- [ ] Design Airdrops database schema
- [ ] Create Airdrops n8n workflow
- [ ] Implement verification system
- [ ] Connect Airdrops page to database
- [ ] Add deadline notifications

### Phase 5: 📝 FUTURE
- [ ] Cross-database analytics
- [ ] Unified search across all databases
- [ ] Data correlation (news → price movements)
- [ ] User-specific data caching

---

## Database Maintenance

### Backup Strategy
- **Analyst DB**: Daily snapshots, 7-day retention
- **Tools DB**: Hourly snapshots, 24-hour retention (high churn data)
- **News DB**: Daily snapshots, 30-day retention
- **Airdrops DB**: Daily snapshots, permanent retention (historical value)

### Data Retention Policies
| Database | Retention Period | Reason |
|----------|------------------|--------|
| Analyst Posts | 90 days | Historical analysis value |
| Top Movers | 7 days | Recent trends only |
| Funding Rates | 30 days | Pattern analysis |
| News Articles | 60 days | Reference and search |
| Airdrops | Permanent | Historical record |

### Monitoring
- Redis memory usage alerts (>80% capacity)
- Slow query logging
- Connection pool monitoring
- Data freshness checks (stale data alerts)

---

## Security Considerations

### Access Control
- Separate Redis credentials per database
- Read-only credentials for application
- Admin credentials only in n8n workflows
- IP whitelist for Redis access

### Data Validation
- Schema validation before storage
- Sanitize user-generated content
- Verify source authenticity
- Rate limiting on API endpoints

### Compliance
- GDPR: No personal data stored
- Data retention policies documented
- Right to deletion support
- Transparent data usage

---

## Performance Optimization

### Caching Strategy
- Client-side: React Query for API responses (5-minute stale time)
- Server-side: Next.js data cache (ISR, 60-second revalidation)
- Redis: In-memory caching with smart TTLs

### Indexing
- Primary keys: `{resource}:{id}`
- Secondary indexes: `{resource}:{field}:{value}`
- Sorted sets for time-series data
- Full-text search indexes for news content

### Scalability
- Horizontal scaling: Add Redis replicas per database
- Load balancing: Round-robin across replicas
- Sharding strategy: By token/symbol for high-volume data
- CDN: Static assets and API responses

---

## Troubleshooting

### Common Issues

**Issue**: Stale data in application
- **Cause**: Cache not invalidating
- **Solution**: Check Redis TTL, verify workflow execution

**Issue**: High Redis memory usage
- **Cause**: Data retention policy not enforced
- **Solution**: Run cleanup job, adjust TTLs

**Issue**: Slow page loads
- **Cause**: Too many Redis queries
- **Solution**: Use pipeline/transaction, implement data aggregation

**Issue**: Missing data
- **Cause**: n8n workflow failure
- **Solution**: Check workflow logs, verify API credentials

---

## Contact & Support

For questions about the database architecture:
- Check workflow documentation: `WORKFLOW_DOCUMENTATION.md`
- Check connection details: `DATABASE_CONNECTION.md`
- Review this architecture: `DATABASE_ARCHITECTURE.md`

---

**Last Updated**: 2025-11-02
**Version**: 1.0
**Status**: Phase 1 Complete, Phases 2-5 Planned

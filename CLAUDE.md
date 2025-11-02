# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start dev server on 0.0.0.0 (for network access)
npm run dev:local        # Start dev server on localhost only
npm run build            # Build Next.js application
npm run start            # Start production server
npm run lint             # Run ESLint (use this for quick validation)

# Redis Database
npm run redis:init       # Seed Redis with initial data
npm run redis:clear      # Clear all Redis data

# Android Build
npm run android:build    # Build and sync to Android with Capacitor
npm run android:open     # Open Android Studio
npm run android:run      # Build and run on Android device
```

## Architecture Overview

### Multi-Database Strategy

This application uses **separate data sources for different features**:

1. **Analyst Insights** (Main Feature)
   - Database: Redis (DB 0)
   - Toggle: Cookie `analyst_data_source` or env `NEXT_PUBLIC_USE_MOCK_DATA`
   - Source: `lib/analystDataSource.ts` (with feature flag)
   - Populated by: n8n workflow (`unity-oracle-workflow.json`)

2. **Trading Tools**
   - Database: Separate Redis DB (planned)
   - Source: `data/toolsData.ts` (currently mock)

3. **News Feed**
   - Database: Separate Redis DB (planned)
   - Source: `data/newsData.ts` (currently mock)

4. **Airdrop Guide**
   - Database: Separate Redis DB (planned)
   - Source: `data/airdropsData.ts` (currently mock)

### Redis Schema (Analyst Data)

**Key Patterns:**
- `post:{postId}` - Complete post data (JSON)
- `token:{TOKEN}:posts` - List of post IDs for token
- `user:{username}:posts` - List of post IDs for analyst
- `timeline:{TOKEN}` - Sorted set (score: timestamp)
- `chart:{TOKEN}` - Chart data (TTL: 1 hour)
- `cache:invalidate:{TOKEN}` - Cache flag (TTL: 5 min)
- `user:preferences:{userId}` - User preferences (JSON)

**Important:** All Redis operations use the singleton `redisService` from `lib/redis.ts`. See `my docs/DATABASE_CONNECTION.md` for complete schema documentation.

### Data Flow (n8n Workflow)

```
Discord/Twitter → Webhook → Parse Tokens → Route by Length
                                            ├─ Short (≤280 chars) → Use Full Content
                                            └─ Long (>280 chars)  → OpenAI GPT-4 Analysis
                                                                    ↓
Extract Chart Data ← AI Response (sentiment, summary, key points)
        ↓
Store in Redis (post, indexes, timeline, chart)
        ↓
Invalidate Cache → Frontend Refreshes
```

See `my docs/WORKFLOW_DOCUMENTATION.md` for complete workflow details.

### Server/Client Component Separation

**Critical Rule:** Client components (`'use client'`) **cannot** import server-only modules.

**Pattern:**
- Server-side data fetching → Use direct imports of `lib/serverData.ts` or `lib/analystDataSource.ts`
- Client-side data needs → Create API route in `app/api/` and fetch via HTTP

**Example:**
```typescript
// ❌ WRONG - Client component importing server-only code
'use client';
import { getTradingPostsByToken } from '@/lib/analystDataSource';

// ✅ CORRECT - Client component using API
'use client';
const response = await fetch('/api/posts?token=BTC');
const { posts } = await response.json();
```

### User Preferences System

**Architecture:**
- **Context:** `lib/user-preferences-context.tsx` (React Context)
- **Client Storage:** localStorage (fast access)
- **Server Storage:** Redis (`user:preferences:{userId}`)
- **API:** `app/api/preferences/route.ts` (GET, POST, DELETE)
- **Sync Pattern:** Auto-save with 2-second debounce

**Preference Types:**
- Trading preferences (risk tolerance, timeframe)
- Notification settings
- Analysis preferences
- Favorite analysts (follow system)

**Usage:**
```typescript
const { preferences, updateTradingPreferences, favoriteAnalyst } = useUserPreferences();
```

## Important File Locations

### Core Data Layer
- `lib/analystDataSource.ts` - Main data source with cookie-based toggle
- `lib/serverData.ts` - Server-only Redis data fetching (marked with `'server-only'`)
- `lib/mockDataFunctions.ts` - Mock data for development
- `lib/redis.ts` - Redis service singleton
- `lib/workflow.ts` - Post processing utilities

### Context Providers
- `lib/user-preferences-context.tsx` - User preferences management
- `lib/data-source-context.tsx` - Data source toggle (analyst data only)
- `lib/auth.tsx` - Authentication context

### API Routes
- `app/api/preferences/route.ts` - User preferences CRUD
- `app/api/activity/route.ts` - Recent posts from followed analysts
- `app/api/webhooks/[platform].ts` - n8n webhook receivers (Discord, Twitter)

### Key Pages
- `app/profile/page.tsx` - User profile with preferences and activity feed
- `app/profile/analyst/[username]/page.tsx` - Dynamic analyst profiles
- `app/analysts/[token]/page.tsx` - Token analysis by all analysts
- `app/analysts/[token]/summary/page.tsx` - Sentiment summary by analyst

## Key Technical Patterns

### 1. Dynamic Routing with Async Params

Next.js 13+ requires awaiting params:

```typescript
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;  // Must await
  // ...
}
```

### 2. Static Site Generation

Use `generateStaticParams` for dynamic routes:

```typescript
export async function generateStaticParams() {
  const tokens = await getAllTokens();
  return tokens.map(token => ({ token: token.toLowerCase() }));
}
```

### 3. Feature Flag Pattern (Cookie-Based)

The app uses cookies (not localStorage) for SSR-compatible feature flags:

```typescript
// Set in client
Cookies.set('analyst_data_source', 'mock' | 'redis');

// Read anywhere (server/client)
const useMock = getDataSourcePreference(); // Checks cookie, then env
```

### 4. Follower/Favorite System

**Storage:**
- `user:preferences:{userId}` → `favoriteAnalysts: string[]`
- `user:followers:{username}` → Set of follower user IDs (future)

**Functions:**
- `favoriteAnalyst(username)` - Add to favorites
- `unfavoriteAnalyst(username)` - Remove from favorites
- `getAnalystFollowerCount(username)` - Count followers (server-only)

### 5. Recent Activity Feed

Shows posts from followed analysts only:

**Flow:**
1. Client reads `favoriteAnalysts` from preferences
2. Calls `/api/activity?favorites=analyst1,analyst2`
3. API fetches posts and filters by analysts
4. Returns last 10 posts sorted by time

## Common Gotchas

### 1. TypeScript `any` Types
The codebase has many `@typescript-eslint/no-explicit-any` errors. When adding new code, prefer proper typing over `any`.

### 2. React Hooks in Effects
`lib/data-source-context.tsx` has a known issue with `setState` in `useEffect`. Don't replicate this pattern.

### 3. Build vs Lint
- Use `npm run lint` for quick validation (faster)
- Use `npm run build` for full validation (catches more errors, but slower)

### 4. Android Build Artifacts
The `android/` folder contains compiled code that generates thousands of lint warnings. These can be ignored.

### 5. Server-Only Imports
Always check if you're in a Client Component before importing:
- `lib/serverData.ts` → Server-only
- `lib/analystDataSource.ts` → Works both sides (has internal check)
- `lib/redis.ts` → Server-only

### 6. Mock vs Real Data Toggle
The data source toggle **only affects analyst insights**. Tools, News, and Airdrops always use their respective data sources.

## Development Workflow

1. **Running Locally:**
   ```bash
   npm run dev:local
   # Access at http://localhost:3000
   ```

2. **Network Testing (mobile/other devices):**
   ```bash
   npm run dev
   # Access at http://<your-ip>:3000
   ```

3. **Quick Validation:**
   ```bash
   npm run lint
   # Fix auto-fixable issues:
   npm run lint -- --fix
   ```

4. **Redis Setup:**
   ```bash
   # First time: seed data
   npm run redis:init

   # Reset database
   npm run redis:clear && npm run redis:init
   ```

5. **Testing Workflow Integration:**
   - Start n8n and import `unity-oracle-workflow.json`
   - Configure webhooks to point to your app
   - Send test posts via Discord/Twitter or manual webhook
   - Check Redis: `redis-cli GET post:{postId}`

## Important Context Files

- `my docs/DATABASE_CONNECTION.md` - Complete Redis schema and query patterns
- `my docs/WORKFLOW_DOCUMENTATION.md` - n8n workflow architecture
- `package.json` - All available scripts
- This file (`CLAUDE.md`) - Architecture overview

## Capacitor (Mobile)

This is a hybrid web/mobile app using Capacitor:

- **Config:** `capacitor.config.ts`
- **Web root:** `out/` (static export)
- **Platform:** Android (iOS not configured)

**Build for Android:**
```bash
npm run android:build  # Builds Next.js and syncs to Android
npm run android:open   # Opens Android Studio
```

## Environment Variables

```bash
# Redis
REDIS_URL=redis://localhost:6379

# Mock Data Toggle (fallback if no cookie)
NEXT_PUBLIC_USE_MOCK_DATA=true

# OpenAI (used by n8n workflow, not frontend)
OPENAI_API_KEY=sk-...
```

## Test User

The app uses a hardcoded test user for development:
- User ID: `'test-doom'`
- Defined in: `lib/user-preferences-context.tsx` and API routes

Replace with real auth when implementing authentication.

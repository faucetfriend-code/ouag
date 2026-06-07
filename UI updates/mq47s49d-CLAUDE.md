# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start dev server on 0.0.0.0 (for network access)
npm run dev:local        # Start dev server on localhost only
npm run build            # Build Next.js application (includes TypeScript check)
npm run export           # Build static export for Capacitor
npm run start            # Start production server
npm run lint             # Run ESLint (use for quick validation)

# Database
npm run db:push          # Push Prisma schema to PostgreSQL
npm run db:studio        # Open Prisma Studio (database GUI)
npm run redis:init       # Seed Redis with initial analyst data
npm run redis:clear      # Clear all Redis data

# Android Build
npm run android:build    # Build Next.js and sync to Android with Capacitor
npm run android:open     # Open Android Studio
npm run android:run      # Build and run on Android device
```

## Architecture Overview

### Multi-Database Strategy

This application uses **two primary databases**:

1. **PostgreSQL (via Prisma)** - Primary database for:
   - User accounts and authentication (NextAuth)
   - User preferences
   - Portfolio holdings and tracking
   - Notification history
   - Subscription management

2. **Redis** - High-performance caching for:
   - Analyst insights and posts
   - Token data and charts
   - Real-time data that needs fast access
   - Cache invalidation patterns

### Database Architecture

**PostgreSQL Schema** (`prisma/schema.prisma`):
- `User` - User accounts with Discord OAuth
- `Account` - NextAuth OAuth connections
- `Session` - NextAuth session management
- `UserPreferences` - User settings and preferences
- `Portfolio` - User's cryptocurrency portfolio
- `PortfolioHolding` - Individual holdings within portfolio
- `Notification` - Notification history

**Redis Schema** (Analyst Data):
- `post:{postId}` - Complete post data (JSON)
- `token:{TOKEN}:posts` - List of post IDs for token
- `user:{username}:posts` - List of post IDs for analyst
- `timeline:{TOKEN}` - Sorted set (score: timestamp)
- `chart:{TOKEN}` - Chart data (TTL: 1 hour)
- `cache:invalidate:{TOKEN}` - Cache flag (TTL: 5 min)

**Important:** PostgreSQL is the source of truth for user data. Redis is used for caching and real-time features.

### Authentication & Authorization

**NextAuth Setup:**
- Provider: Discord OAuth
- Session strategy: JWT with database persistence
- Server membership validation on login
- User interface in `lib/auth-context.tsx` converts NextAuth session to app User type

**Auth Flow:**
```
User clicks "Login with Discord"
  → NextAuth redirects to Discord OAuth
  → User authorizes app
  → NextAuth callback validates Discord server membership
  → Creates/updates User in PostgreSQL
  → Sets JWT session cookie
  → User object available via `useAuth()` hook
```

**Key Files:**
- `lib/auth.ts` - NextAuth configuration (Discord provider, callbacks)
- `lib/auth-context.tsx` - React context wrapping NextAuth session
- `components/Providers.tsx` - Provider wrapper including SessionProvider
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route

**Usage:**
```typescript
const { user, loading, login, logout, canAccessPremium } = useAuth();
```

**CRITICAL:** NextAuth requires `SessionProvider` wrapper. All providers are consolidated in `components/Providers.tsx` which wraps:
1. `SessionProvider` (NextAuth)
2. `LoadingProvider`
3. `AuthProvider` (custom)
4. `UserPreferencesProvider`

### User Preferences System

**Dual-Storage Architecture:**
- **localStorage:** Immediate client-side access (no network delay)
- **PostgreSQL:** Persistent server storage via Prisma

**Sync Pattern:**
1. User changes preference in UI
2. Immediately saved to localStorage
3. Debounced 2-second delay before PostgreSQL save
4. API call to `/api/preferences` (authenticated via NextAuth session)
5. Prisma upserts to UserPreferences table

**Preference Categories:**
```typescript
{
  currency, timezone, theme, language,        // Display preferences
  emailNotifications, pushNotifications,      // Notification preferences
  priceAlerts, analystUpdates, marketNews,   // Alert preferences
  riskTolerance, defaultTimeframe,           // Trading preferences
  favoriteTokens                             // Followed/favorite tokens
}
```

**Key Files:**
- `lib/user-preferences-context.tsx` - React context with debounced sync
- `app/api/preferences/route.ts` - API endpoints (GET, POST, DELETE)
- `prisma/schema.prisma` - UserPreferences model

### Portfolio System

**Real-Time Portfolio Tracking:**
- Stores user's cryptocurrency holdings in PostgreSQL
- Fetches live prices from CoinGecko API with caching
- Calculates total value, P&L, and allocation percentages
- Supports CSV/JSON import via `PortfolioImportModal`

**Data Flow:**
```
User imports portfolio → CSV/JSON parser → Validation
  → API call to /api/portfolio → Prisma creates holdings
  → CoinGecko API fetch → Cache prices (5 min TTL)
  → Calculate total value & P&L → Return to frontend
```

**Key Components:**
- `app/api/portfolio/route.ts` - Portfolio CRUD
- `app/api/portfolio/refresh/route.ts` - Price refresh endpoint
- `components/PortfolioImportModal.tsx` - Import UI
- `components/PositionTracker.tsx` - Leveraged position tracking

### Notification System

**Multi-Platform Push Notifications:**
- **Web:** Service worker with Push API
- **Android:** Firebase Cloud Messaging (FCM)
- **iOS:** Apple Push Notification Service (APNs)

**Architecture:**
```
Trigger (price alert, analyst post)
  → Notification Service generates notification
  → Check user preferences (are notifications enabled?)
  → Store in PostgreSQL (Notification table)
  → Send push via platform API (Web Push/FCM/APNs)
  → Update unread count badge
```

**Key Files:**
- `lib/notifications.ts` - Notification service
- `components/NotificationCenter.tsx` - In-app notification UI
- `app/api/notifications/` - Notification API routes
- `public/service-worker.js` - Web push handler

**Features:**
- Badge count on navigation bell icon
- Notification history with read/unread status
- Category filtering (price alerts, portfolio, news, system)
- Quick actions from notifications

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
- Server-side data fetching → Use direct imports or Prisma client
- Client-side data needs → Create API route in `app/api/` and fetch via HTTP
- Authentication checks → Use NextAuth `auth()` on server, `useAuth()` on client

**Example:**
```typescript
// ❌ WRONG - Client component importing Prisma
'use client';
import { prisma } from '@/lib/prisma';

// ✅ CORRECT - Client component using API
'use client';
const response = await fetch('/api/posts?token=BTC');
const { posts } = await response.json();
```

## Important File Locations

### Core Data Layer
- `lib/prisma.ts` - Prisma client singleton
- `lib/redis.ts` - Redis service singleton
- `lib/analystDataSource.ts` - Analyst data with cookie-based mock/Redis toggle
- `lib/serverData.ts` - Server-only Redis data fetching (marked with `'server-only'`)
- `lib/mockDataFunctions.ts` - Mock data for development
- `lib/workflow.ts` - Post processing utilities

### Authentication & Authorization
- `lib/auth.ts` - NextAuth configuration (Discord OAuth, callbacks, JWT)
- `lib/auth-context.tsx` - React context wrapping NextAuth
- `components/Providers.tsx` - Consolidated provider wrapper (SessionProvider + all contexts)
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler

### Context Providers
- `components/Providers.tsx` - **Main provider wrapper** (use this in layout)
- `lib/user-preferences-context.tsx` - User preferences with PostgreSQL sync
- `lib/data-source-context.tsx` - Data source toggle (analyst data only)
- `lib/auth-context.tsx` - Authentication state management
- `lib/loading-context.tsx` - Global loading state

### API Routes
- `app/api/preferences/route.ts` - User preferences CRUD (Prisma)
- `app/api/portfolio/route.ts` - Portfolio management (Prisma + CoinGecko)
- `app/api/notifications/` - Notification endpoints
- `app/api/activity/route.ts` - Recent posts from followed analysts
- `app/api/webhooks/[platform].ts` - n8n webhook receivers

### Key Pages
- `app/profile/page.tsx` - User profile with portfolio, preferences, activity feed
- `app/profile/analyst/[username]/page.tsx` - Dynamic analyst profiles
- `app/analysts/[token]/page.tsx` - Token analysis by all analysts
- `app/analysts/[token]/summary/page.tsx` - Sentiment summary by analyst
- `app/comments/page.tsx` - Chronological feed of all analyst posts

### Settings & Modals
- `components/settings/SecuritySettingsModal.tsx` - Password, 2FA, sessions
- `components/settings/NotificationSettingsModal.tsx` - Notification preferences
- `components/settings/CurrencySettingsModal.tsx` - Display preferences
- `components/PortfolioImportModal.tsx` - CSV/JSON import
- `components/NotificationCenter.tsx` - Notification inbox UI

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

### 3. Authentication-Protected API Routes

All API routes requiring auth should check NextAuth session:

```typescript
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Proceed with authenticated logic
  const userId = session.user.id;
  // ...
}
```

### 4. Prisma Query Patterns

Common Prisma operations:

```typescript
// Find unique by ID
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// Upsert (create or update)
const prefs = await prisma.userPreferences.upsert({
  where: { userId },
  update: { currency: 'EUR' },
  create: { userId, currency: 'EUR' }
});

// Include relations
const portfolio = await prisma.portfolio.findFirst({
  where: { userId },
  include: { holdings: true }
});
```

### 5. Mobile-Specific Features

**Swipe Gestures:**
- Uses `@use-gesture/react` for swipe detection
- Edge swipe from left opens mobile menu
- Implemented in `components/Navigation.tsx`

**Haptic Feedback:**
- `lib/haptics.ts` provides tactile feedback functions
- `lightImpact()`, `mediumImpact()`, `heavyImpact()`
- Used for menu toggles, button presses, notifications

**Progressive Web App:**
- Service worker in `public/service-worker.js`
- Handles push notifications when app is closed
- Offline caching for basic functionality

## Common Gotchas

### 1. NextAuth SessionProvider Required

**CRITICAL:** Client components using `useAuth()` or `useSession()` require `SessionProvider` wrapper.

```typescript
// ❌ WRONG - Missing SessionProvider causes build/runtime errors
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>  {/* useSession() inside will fail */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// ✅ CORRECT - Use Providers component
import { Providers } from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>  {/* Includes SessionProvider */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Pages with auth must use dynamic rendering:**
```typescript
// Add to any page using useAuth/useSession
export const dynamic = 'force-dynamic';
```

### 2. NextAuth Session Type Extension

NextAuth's default session type doesn't include our custom User fields. Extend it:

```typescript
// In lib/auth-context.tsx, cast to custom User interface
const user: User = {
  id: session.user.id,
  discordId: (session.user as any).discordId,
  // ...
};
```

### 3. TypeScript Implicit 'any' Errors

When adding callback functions in `.map()`, `.filter()`, `.reduce()`, etc., you MUST add type annotations:

```typescript
// ❌ WRONG - Implicit 'any' type error
const tokens = holdings.map(h => h.token);
const total = values.reduce((sum, v) => sum + v, 0);

// ✅ CORRECT - Add type annotations
const tokens = holdings.map((h: { token: string }) => h.token);
const total = values.reduce((sum: number, v: number) => sum + v, 0);
```

**Common patterns:**
```typescript
// Filter + map
items.filter((item: { active: boolean }) => item.active)
     .map((item: { id: string }) => item.id);

// Reduce with object
items.reduce((acc: Record<string, number>, item: { key: string; value: number }) => {
  acc[item.key] = item.value;
  return acc;
}, {});
```

### 4. Prisma Client Singleton

Always import from `lib/prisma.ts`, never instantiate directly:

```typescript
// ✅ CORRECT
import { prisma } from '@/lib/prisma';

// ❌ WRONG
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

### 5. Settings Modals Use Toast Notifications

Use `lib/toast.ts` functions instead of `alert()`:

```typescript
import { showSuccess, showError } from '@/lib/toast';

showSuccess('Settings saved!');
showError('Failed to save settings');
```

### 6. TypeScript `any` Types

The codebase has many `@typescript-eslint/no-explicit-any` errors (see TDB.md). When adding new code, prefer proper typing over `any`.

### 7. Build vs Lint

- Use `npm run lint` for quick validation (faster, shows warnings + errors)
- Use `npm run build` for full validation (catches TypeScript errors, but slower)
- **Build failures are blocking** - fix these first before deploying

### 8. Server-Only Imports

Always check if you're in a Client Component before importing:
- `lib/prisma.ts` → Server-only
- `lib/serverData.ts` → Server-only
- `lib/analystDataSource.ts` → Works both sides (has internal check)
- `lib/redis.ts` → Server-only

### 9. Mock vs Real Data Toggle

The data source toggle **only affects analyst insights**. Tools, News, and Airdrops always use their respective data sources.

### 10. Firebase Environment Variables

Firebase Admin SDK requires properly formatted environment variables:

```bash
# Individual fields (recommended for local development)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Note: FIREBASE_PRIVATE_KEY must include escaped newlines (\n)
# Copy from Firebase Console → Project Settings → Service Accounts → Generate Key
```

If you see "Failed to parse private key" errors, check that:
1. Private key includes proper `\n` escape sequences
2. Key is wrapped in quotes in `.env.local`
3. No extra whitespace or formatting issues

## Development Workflow

1. **Initial Setup:**
   ```bash
   # Install dependencies
   npm install

   # Configure environment (see ENVIRONMENT_SETUP.md)
   # Edit .env.local with your database URLs and API keys

   # Verify environment configuration
   npm run verify-env

   # Generate Prisma client (REQUIRED before first run)
   npx prisma generate

   # Setup PostgreSQL database schema
   npm run db:push

   # (Optional) Seed Redis with analyst data
   npm run redis:init
   ```

   **Important:** If `npx prisma generate` fails, see `KNOWN_ISSUES.md` for troubleshooting.

2. **Running Locally:**
   ```bash
   npm run dev:local
   # Access at http://localhost:3000
   ```

3. **Network Testing (mobile/other devices):**
   ```bash
   npm run dev
   # Access at http://<your-ip>:3000
   ```

4. **Database Management:**
   ```bash
   # View/edit database in browser
   npm run db:studio

   # Apply schema changes
   npm run db:push
   ```

5. **Quick Validation:**
   ```bash
   npm run lint
   # Fix auto-fixable issues:
   npm run lint -- --fix
   ```

6. **Testing Workflow Integration:**
   - Start n8n and import `unity-oracle-workflow.json`
   - Configure webhooks to point to your app
   - Send test posts via Discord/Twitter or manual webhook
   - Check Redis: `redis-cli GET post:{postId}`

## Important Context Files

- `ENVIRONMENT_SETUP.md` - **Environment configuration guide (START HERE)**
- `KNOWN_ISSUES.md` - Known issues and troubleshooting
- `my docs/DATABASE_CONNECTION.md` - Complete Redis schema and query patterns
- `my docs/WORKFLOW_DOCUMENTATION.md` - n8n workflow architecture
- `prisma/schema.prisma` - PostgreSQL database schema
- `lib/coingecko-mappings.ts` - Shared CoinGecko token mappings
- `TDB.md` - Known issues, TODOs, and code quality notes
- `package.json` - All available scripts
- This file (`CLAUDE.md`) - Architecture overview

## Capacitor (Mobile)

This is a hybrid web/mobile app using Capacitor:

- **Config:** `capacitor.config.ts`
- **Web root:** `out/` (static export from Next.js)
- **Platforms:** Android (configured), iOS (planned)

**Build for Android:**
```bash
npm run android:build  # Builds Next.js and syncs to Android
npm run android:open   # Opens Android Studio
```

**Mobile Features:**
- Push notifications (FCM for Android, APNs for iOS)
- Swipe gestures for navigation
- Haptic feedback
- Service worker for offline functionality
- Biometric authentication (placeholder, not fully implemented)

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/unity_oracle
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_SERVER_ID=your_server_id  # For membership validation

# CoinGecko API (for portfolio prices)
COINGECKO_API_KEY=your_api_key  # Optional, free tier works

# Mock Data Toggle (fallback if no cookie)
NEXT_PUBLIC_USE_MOCK_DATA=false

# OpenAI (used by n8n workflow, not frontend)
OPENAI_API_KEY=sk-...

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
FCM_SERVER_KEY=your_fcm_server_key
```

## Known Limitations & TODOs

### Security Settings (Partially Implemented)
- Password change form exists but API endpoint needs implementation
- 2FA toggle exists but backend not connected
- Biometric authentication temporarily disabled (Capacitor plugin issue)
- Session management UI exists but needs API endpoints

### Subscription System (Placeholder)
- Subscription display works with test data
- "Subscribe Now" button exists but no payment integration
- No Stripe/PayPal integration yet
- Subscription validation exists but defaults to test access

### Data Persistence
- User preferences: ✅ Complete (PostgreSQL via Prisma)
- Portfolio: ✅ Complete (PostgreSQL via Prisma)
- Notifications: ✅ Complete (PostgreSQL via Prisma)
- Analyst posts: ✅ Complete (Redis)
- Trading tools data: ❌ Still using mock data

See `TDB.md` for complete list of known issues and implementation priorities.

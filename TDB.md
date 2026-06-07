# Unity Oracle Aggregator - Implementation Roadmap

**Last Updated:** 2025-11-05
**Status:** ~60% Complete - UI/Frontend largely done, Backend API integrations needed
**Estimated Time to MVP:** 2 weeks (30-40 hours)

---

## 📊 STATUS LEGEND

- ✅ **COMPLETE** - Fully implemented and tested
- ⚠️ **PARTIAL** - UI complete, backend incomplete or using mock data
- 🔄 **IN PROGRESS** - Currently being worked on
- ❌ **NOT STARTED** - Placeholder or mock data only
- 💻 **LOCAL ONLY** - Works locally, needs cloud deployment
- 🚀 **DEPLOYED** - Live in production

---

## 🚨 CRITICAL BLOCKERS FOR PRODUCTION

### Database Deployment Required
**Status:** 💻 LOCAL ONLY (Critical blocker)

Both databases currently run locally and MUST be deployed to cloud before production:

1. **PostgreSQL** - Currently local, needs **Supabase** (free tier available)
   - User accounts, preferences, portfolio, subscriptions
   - Free tier: 500MB, 50K monthly active users

2. **Redis** - Currently local, needs **Upstash** (free tier available)
   - Analyst posts, news, tools data, airdrops
   - Free tier: 256MB, 10K commands/day

**Blockers:** Almost all features depend on database deployment
**Time Required:** 1 hour total
**Cost:** $0/month (free tiers)

---

## PHASE 1: CRITICAL INFRASTRUCTURE (Week 1-2)

### 1.1 PostgreSQL Deployment to Supabase
**Status:** 💻 LOCAL ONLY
**Priority:** 🔴 CRITICAL
**Blockers:** None
**Dependencies:** None
**Time:** 30 minutes
**Cost:** $0/month (500MB free tier)

**Tasks:**
- [ ] Create Supabase account at https://supabase.com/dashboard
- [ ] Create new project
- [ ] Copy DATABASE_URL to `.env.local`
- [ ] Update `lib/prisma.ts` if needed for cloud connection
- [ ] Run `npx prisma db push` to create schema in cloud
- [ ] Test connection from app

**Files:**
- `lib/prisma.ts` - Prisma client singleton
- `.env.local` - Environment variables
- `prisma/schema.prisma` - Database schema

**Acceptance Criteria:**
- [ ] Supabase project created
- [ ] DATABASE_URL updated in .env
- [ ] All Prisma tables created in Supabase
- [ ] Can read/write users from app
- [ ] Local development still works

---

### 1.2 Redis Dual-Mode Deployment
**Status:** ✅ COMPLETE (Dual-mode: TCP + REST)
**Priority:** 🔴 CRITICAL
**Blockers:** None
**Dependencies:** None
**Time:** Completed
**Cost:** $0/month (Redis Cloud unlimited + Vercel KV 3K commands/day fallback)

**Implementation:**
- [x] Link project to Vercel: `vercel link`
- [x] Create Vercel KV database via Vercel Dashboard (Storage tab)
- [x] Pull environment variables: `vercel env pull .env.development.local`
- [x] Install `@upstash/redis`: `npm install @upstash/redis`
- [x] Update `lib/redis.ts` to support dual-mode (TCP + REST)
- [x] Configure environment variables for both Redis instances
- [ ] Test storing and retrieving analyst posts (pending real data)
- [ ] Verify n8n workflow can write to Redis (pending workflow setup)

**Architecture:**

**Dual-Mode Strategy:**
The app now supports two Redis connection modes that automatically switch based on environment:

1. **TCP Mode (Redis Cloud)** - Used for local development
   - Traditional TCP connection via `redis` package
   - Unlimited commands (30MB free tier)
   - Connection: `redis://default:...@redis-14778.c15.us-east-1-2.ec2.redns.redis-cloud.com:14778`
   - Environment variable: `REDIS_URL`

2. **REST Mode (Vercel KV)** - Used for Vercel serverless deployments
   - REST API connection via `@upstash/redis` package
   - 256MB storage, 3K commands/day (free tier)
   - Connection: `https://notable-ape-34094.upstash.io`
   - Environment variables: `UAO_KV_REST_API_URL`, `UAO_KV_REST_API_TOKEN`

**Auto-Detection:**
- Checks for `VERCEL` environment variable
- If present → REST mode (Vercel KV)
- If absent → TCP mode (Redis Cloud)

**Files Modified:**
- `lib/redis.ts` - Refactored to support both TCP and REST clients
- `.env.development.local` - Contains credentials for both Redis instances
- `.env.local` - Template with placeholder values

**Acceptance Criteria:**
- [x] Vercel project linked
- [x] Vercel KV database created
- [x] lib/redis.ts updated for dual-mode support
- [x] Both REDIS_URL and UAO_KV_* variables configured
- [x] Local development uses Redis Cloud (TCP)
- [x] Vercel deployments use Vercel KV (REST)
- [ ] Posts can be read/write from app (pending real data)
- [ ] n8n workflow can write to Redis Cloud (pending workflow)

**Data Isolation:**
- Local development → Redis Cloud (separate database)
- Production deployment → Vercel KV (separate database)
- Intentionally isolated to prevent conflicts

**Migration Strategy:**
When ready to sync data between environments:
1. Use `npm run redis:init` to seed Redis Cloud locally
2. Deploy to Vercel and seed Vercel KV via API endpoint
3. Or: Create migration script to copy data between instances

**Why Dual-Mode:**
- **Best of both worlds**: Unlimited commands locally, serverless compatibility in production
- **Cost-effective**: Free Redis Cloud for development, minimal Vercel KV usage for production
- **Zero configuration**: Automatic mode detection based on environment
- **Future-proof**: Can easily switch to single Redis instance if needed

---

### 1.3 Stripe Payment Integration (DE-PRIORITIZED)
**Status:** ❌ DE-PRIORITIZED (Not required for Discord Members-Only MVP)
**Priority:** ⚪ LOW / DE-PRIORITIZED (App is free for verified Discord server members; Future plan: Crypto Payments)
**Blockers:** None (Feature shelved)
**Dependencies:** None
**Time:** N/A
**Cost:** $0


**Current State:**
- ✅ UI complete (`app/settings/subscription/page.tsx`)
- ✅ Settings modal complete (`components/settings/SubscriptionSettingsModal.tsx`)
- ❌ API routes are placeholders with TODO comments
- ❌ Stripe SDK not installed
- ❌ Subscription model not in database
- ❌ Webhook handler doesn't exist

**Tasks:**
- [ ] Create Stripe account at https://dashboard.stripe.com/register
- [ ] Install Stripe SDK: `npm install stripe`
- [ ] Add `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` to `.env.local`
- [ ] Add Subscription model to `prisma/schema.prisma`
- [ ] Run `npx prisma db push`
- [ ] Create `lib/stripe.ts` singleton
- [ ] Implement `/api/subscription/route.ts` (subscribe, cancel, reactivate)
- [ ] Implement `/api/billing/payment-methods/route.ts` (add, remove, list)
- [ ] Implement `/api/billing/invoices/route.ts` (fetch invoice history)
- [ ] Create `/api/webhooks/stripe/route.ts` for webhook events
- [ ] Configure webhook endpoint in Stripe dashboard
- [ ] Test subscription creation flow
- [ ] Test subscription cancellation
- [ ] Test payment method management

**Files:**
- `prisma/schema.prisma` - Add Subscription model
- `lib/stripe.ts` - NEW FILE (Stripe client)
- `app/api/subscription/route.ts` - Replace TODO with implementation
- `app/api/billing/payment-methods/route.ts` - Replace TODO
- `app/api/billing/invoices/route.ts` - Replace TODO
- `app/api/webhooks/stripe/route.ts` - NEW FILE

**Database Schema Addition:**
```prisma
model Subscription {
  id                   String    @id @default(cuid())
  userId               String    @unique
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId     String    @unique
  stripeSubscriptionId String?   @unique
  stripePriceId        String?
  status               String    // active, canceled, past_due, trialing
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean   @default(false)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

// Also add to User model:
model User {
  // ... existing fields
  subscription      Subscription?
}
```

**Acceptance Criteria:**
- [ ] Stripe account created (test mode)
- [ ] Subscription model in database
- [ ] Can create subscription via UI
- [ ] Can cancel subscription
- [ ] Can add/remove payment methods
- [ ] Webhooks process correctly
- [ ] Invoice history displays
- [ ] UI shows correct subscription status

**Reference:** See `makeconnections.md` lines 59-128 for detailed implementation guide

---

### 1.4 Firebase Admin SDK Setup
**Status:** ⚠️ PARTIAL (Client complete, server incomplete)
**Priority:** 🔴 HIGH
**Blockers:** None
**Dependencies:** None
**Time:** 2-3 hours
**Cost:** $0/month (unlimited notifications)

**Current State:**
- ✅ Client-side FCM setup complete (`lib/push-notifications.ts`)
- ✅ Service worker registered (`public/firebase-messaging-sw.js`)
- ✅ Push token collection working
- ✅ Notification center UI complete (`components/NotificationCenter.tsx`)
- ❌ Server-side sending not implemented
- ❌ Firebase Admin SDK not initialized

**Tasks:**
- [ ] Go to Firebase Console → Project Settings → Service Accounts
- [ ] Generate new private key (downloads JSON file)
- [ ] Copy entire JSON content as single-line string to `.env.local` as `FIREBASE_ADMIN_SERVICE_ACCOUNT`
- [ ] Install: `npm install firebase-admin`
- [ ] Create `lib/firebase-admin.ts` with singleton pattern
- [ ] Implement `/api/notifications/send/route.ts` fully
- [ ] Implement `/api/notifications/test/route.ts` for testing
- [ ] Test sending notification from backend

**Files:**
- `lib/firebase-admin.ts` - NEW FILE (Firebase Admin singleton)
- `app/api/notifications/send/route.ts` - Complete implementation
- `app/api/notifications/test/route.ts` - Complete implementation
- `.env.local` - Add FIREBASE_ADMIN_SERVICE_ACCOUNT

**Acceptance Criteria:**
- [ ] Firebase Admin initialized
- [ ] Can send notification via API endpoint
- [ ] Notifications received on web client
- [ ] Test endpoint works
- [ ] Error handling for invalid tokens

**Reference:** See `makeconnections.md` lines 486-558 for implementation guide

---

## PHASE 2: CORE SECURITY FEATURES (Week 3-4)

### 2.1 Two-Factor Authentication (2FA)
**Status:** ❌ NOT STARTED (placeholder exists)
**Priority:** 🔴 HIGH (security best practice)
**Blockers:** Task 1.1 (PostgreSQL deployment)
**Dependencies:** PostgreSQL/Supabase
**Time:** 4-6 hours
**Cost:** $0 (free npm library)

**Current State:**
- ✅ UI complete in `components/settings/SecuritySettingsModal.tsx`
- ✅ Enable/disable toggle exists
- ❌ API endpoint is placeholder (`app/api/security/two-factor/route.ts`)
- ❌ No QR code generation
- ❌ No TOTP verification
- ❌ User model doesn't have 2FA fields

**Tasks:**
- [ ] Install: `npm install otplib qrcode`
- [ ] Add 2FA fields to User model in `prisma/schema.prisma`
- [ ] Run `npx prisma db push`
- [ ] Implement POST `/api/security/two-factor` (enable 2FA, return QR code)
- [ ] Implement DELETE `/api/security/two-factor` (disable 2FA)
- [ ] Create POST `/api/security/two-factor/verify` (verify TOTP code)
- [ ] Update `lib/auth.ts` NextAuth sign-in callback to check 2FA
- [ ] Generate and store 10 backup codes (hashed)
- [ ] Test with Google Authenticator app

**Files:**
- `prisma/schema.prisma` - Extend User model
- `app/api/security/two-factor/route.ts` - Full implementation
- `app/api/security/two-factor/verify/route.ts` - NEW FILE
- `lib/auth.ts` - Update sign-in callback

**Database Schema Addition:**
```prisma
model User {
  // ... existing fields
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?   // Store encrypted
  backupCodes       String[]  // Array of hashed backup codes
}
```

**Acceptance Criteria:**
- [ ] Can enable 2FA via settings
- [ ] QR code displays correctly
- [ ] Google Authenticator can scan QR
- [ ] TOTP codes verify correctly
- [ ] Login requires 2FA when enabled
- [ ] Backup codes work
- [ ] Can disable 2FA

**Reference:** See `makeconnections.md` lines 604-662 for implementation guide

---

### 2.2 Password Change API
**Status:** ❌ NOT STARTED (placeholder exists)
**Priority:** 🟡 MEDIUM
**Blockers:** None
**Dependencies:** bcrypt (already installed via NextAuth)
**Time:** 1-2 hours
**Cost:** $0

**Current State:**
- ✅ UI complete in `components/settings/SecuritySettingsModal.tsx`
- ✅ Form with current/new password fields
- ❌ API endpoint is placeholder (`app/api/auth/change-password/route.ts`)

**Tasks:**
- [ ] Implement POST `/api/auth/change-password`
- [ ] Verify current password with `bcrypt.compare()`
- [ ] Validate new password strength (8+ chars, uppercase, lowercase, number, special)
- [ ] Hash new password with `bcrypt.hash()` (10 rounds)
- [ ] Update user password in database
- [ ] Optionally invalidate all other sessions
- [ ] Test password change flow

**Files:**
- `app/api/auth/change-password/route.ts` - Full implementation

**Acceptance Criteria:**
- [ ] Current password verified correctly
- [ ] New password meets strength requirements
- [ ] Password updated in database
- [ ] Can log in with new password
- [ ] Error handling for wrong current password
- [ ] Clear error messages for weak passwords

---

### 2.3 Session Management
**Status:** ❌ NOT STARTED (mock data only)
**Priority:** 🟡 MEDIUM
**Blockers:** Task 1.1 (PostgreSQL deployment)
**Dependencies:** PostgreSQL/Supabase
**Time:** 3-4 hours
**Cost:** $0 (Abstract API free tier: 20K/month)

**Current State:**
- ✅ UI complete in `components/settings/SecuritySettingsModal.tsx`
- ✅ Session list display with device/location
- ❌ API returns mock data (`app/api/security/sessions/route.ts`)
- ❌ Session model doesn't track device/location
- ❌ Cannot terminate sessions

**Tasks:**
- [ ] Create Abstract API account at https://app.abstractapi.com (free)
- [ ] Install: `npm install ua-parser-js`
- [ ] Add `ABSTRACT_API_KEY` to `.env.local`
- [ ] Extend Session model with device/location fields
- [ ] Run `npx prisma db push`
- [ ] Update `lib/auth.ts` NextAuth callbacks to track device info
- [ ] Use `ua-parser-js` to parse User-Agent
- [ ] Call Abstract API for IP geolocation (city, country)
- [ ] Implement GET `/api/security/sessions` (list all user sessions)
- [ ] Implement DELETE `/api/security/sessions/[sessionId]` (terminate one)
- [ ] Implement DELETE `/api/security/sessions?all=true` (terminate all others)
- [ ] Test session tracking and termination

**Files:**
- `prisma/schema.prisma` - Extend Session model
- `lib/auth.ts` - Update NextAuth callbacks
- `app/api/security/sessions/route.ts` - Full implementation
- `app/api/security/sessions/[sessionId]/route.ts` - Full implementation

**Database Schema Addition:**
```prisma
model Session {
  // ... existing NextAuth fields
  deviceType       String?
  browser          String?
  browserVersion   String?
  os               String?
  osVersion        String?
  ipAddress        String?
  location         String?  // "San Francisco, CA, US"
  lastActivity     DateTime @updatedAt
}
```

**Acceptance Criteria:**
- [ ] Device info captured on login
- [ ] Location info captured (city, country)
- [ ] Can list all active sessions
- [ ] Current session marked clearly
- [ ] Can terminate individual session
- [ ] Can terminate all other sessions
- [ ] Session list updates correctly

**Reference:** See `makeconnections.md` lines 798-883 for implementation guide

---

## PHASE 3: CONTENT & DATA (Week 5-6)

### 3.1 News Aggregation (RSS Feeds)
**Status:** ❌ NOT STARTED (mock data only)
**Priority:** 🟢 MEDIUM
**Blockers:** Task 1.2 (Redis deployment)
**Dependencies:** Redis/Upstash
**Time:** 3-4 hours
**Cost:** $0 (RSS feeds are free)

**Current State:**
- ✅ News page UI complete (`app/news/page.tsx`)
- ❌ Uses mock data from `lib/newsData.ts`
- ❌ No RSS parsing
- ❌ No real news sources

**Tasks:**
- [ ] Install: `npm install rss-parser`
- [ ] Update `lib/newsData.ts` to parse RSS feeds
- [ ] Create RSS aggregation function for:
  - CoinDesk: https://www.coindesk.com/arc/outboundfeeds/rss/
  - CoinTelegraph: https://cointelegraph.com/rss
  - Decrypt: https://decrypt.co/feed
  - The Block: https://www.theblock.co/rss.xml
- [ ] Merge all feeds, deduplicate by URL
- [ ] Store in Redis with keys: `news:{articleId}`, `news:timeline`
- [ ] Create `/api/news/route.ts` to fetch from Redis
- [ ] Create n8n workflow for scheduled RSS fetching (every hour)
- [ ] Update `app/news/page.tsx` to fetch real data
- [ ] Test news aggregation

**Files:**
- `lib/newsData.ts` - Replace mock functions
- `app/api/news/route.ts` - NEW FILE
- n8n workflow JSON - NEW FILE

**Acceptance Criteria:**
- [ ] RSS feeds parse correctly
- [ ] News from all 4 sources aggregated
- [ ] Duplicates removed
- [ ] News stored in Redis
- [ ] News page shows real articles
- [ ] Articles sorted by date (newest first)
- [ ] n8n workflow runs hourly

**Reference:** See `makeconnections.md` lines 320-389 for implementation guide

---

### 3.2 Trading Tools Real Data
**Status:** ❌ NOT STARTED (mock data only)
**Priority:** 🟢 MEDIUM
**Blockers:** Task 1.2 (Redis deployment)
**Dependencies:** Redis/Upstash
**Time:** 4-5 hours
**Cost:** $0 (CoinGecko free tier: 10K calls/month)

**Current State:**
- ✅ Trading tools UI complete (`app/tools/page.tsx`)
- ❌ All tools use mock data from `lib/toolsData.ts`
- ❌ No real market data

**Tasks:**
- [ ] Update `lib/toolsData.ts` to fetch from CoinGecko API
- [ ] Implement top gainers/losers (CoinGecko)
- [ ] Implement top volume (CoinGecko)
- [ ] Implement funding rates (Binance free API)
- [ ] Store in Redis with keys: `tools:movers`, `tools:funding`
- [ ] Set TTL: 15 minutes
- [ ] Create `/api/tools/movers/route.ts` and `/api/tools/funding/route.ts`
- [ ] Create n8n workflow for periodic updates (every 15 min)
- [ ] Update tools pages to fetch real data
- [ ] Monitor CoinGecko API usage (free tier limit: 10K/month)

**Files:**
- `lib/toolsData.ts` - Replace mock functions
- `app/api/tools/movers/route.ts` - NEW FILE
- `app/api/tools/funding/route.ts` - NEW FILE
- n8n workflow JSON - NEW FILE

**CoinGecko Endpoints:**
```
Top Gainers: GET /api/v3/coins/markets?vs_currency=usd&order=percent_change_24h_desc
Top Volume: GET /api/v3/coins/markets?vs_currency=usd&order=volume_desc
Binance Funding: GET https://fapi.binance.com/fapi/v1/fundingRate
```

**Acceptance Criteria:**
- [ ] Top gainers/losers show real data
- [ ] Top volume shows real data
- [ ] Funding rates show real data
- [ ] Data cached in Redis (15 min TTL)
- [ ] Tools pages show real data
- [ ] n8n workflow runs every 15 min
- [ ] Staying within CoinGecko free tier

**Reference:** See `makeconnections.md` lines 189-316 for implementation guide

---

### 3.3 Airdrop Tracking (Web Scraping)
**Status:** ❌ NOT STARTED (mock data only)
**Priority:** 🔵 LOW
**Blockers:** Task 1.2 (Redis deployment)
**Dependencies:** Redis/Upstash
**Time:** 4-6 hours
**Cost:** $0 (web scraping is free)

**Current State:**
- ✅ Airdrops page UI complete (`app/airdrops/page.tsx`)
- ❌ Uses mock data from `lib/airdropsData.ts`
- ❌ No real airdrop sources

**Tasks:**
- [ ] Install: `npm install cheerio axios`
- [ ] Create scraping function for airdrops.io
- [ ] Parse airdrop cards (title, value, end date, requirements)
- [ ] Optional: AI verification with GPT-4 to detect scams
- [ ] Store in Redis with keys: `airdrop:{id}`, `airdrops:active`
- [ ] Create `/api/airdrops/route.ts` to fetch from Redis
- [ ] Create n8n workflow for scheduled scraping (every 6 hours)
- [ ] Update `app/airdrops/page.tsx` to fetch real data
- [ ] Test scraping

**Files:**
- `lib/airdropsData.ts` - Replace mock functions
- `app/api/airdrops/route.ts` - NEW FILE
- n8n workflow JSON - NEW FILE

**Acceptance Criteria:**
- [ ] airdrops.io scraping works
- [ ] Airdrop data parsed correctly
- [ ] Stored in Redis
- [ ] Airdrops page shows real data
- [ ] Airdrops sorted by end date
- [ ] n8n workflow runs every 6 hours
- [ ] Error handling for website changes

**Note:** Web scraping may break if websites change structure. Maintenance required.

**Reference:** See `makeconnections.md` lines 415-481 for implementation guide

---

### 3.4 Image Uploads (Cloudinary)
**Status:** ❌ NOT STARTED
**Priority:** 🔵 LOW
**Blockers:** None
**Dependencies:** None
**Time:** 2-3 hours
**Cost:** $0 (Cloudinary free tier: 25 credits/month)

**Current State:**
- ⚠️ Profile page has placeholder avatar
- ❌ No avatar upload functionality
- ❌ Cloudinary not integrated

**Tasks:**
- [ ] Create Cloudinary account at https://cloudinary.com/users/register_free
- [ ] Install: `npm install cloudinary`
- [ ] Add Cloudinary credentials to `.env.local`
- [ ] Add `avatarUrl` field to User model (if not exists)
- [ ] Run `npx prisma db push`
- [ ] Create `lib/cloudinary.ts` config
- [ ] Implement POST `/api/user/profile` (avatar upload)
- [ ] Configure image transformations (200x200, face detection)
- [ ] Update profile page to upload avatar
- [ ] Test upload

**Files:**
- `lib/cloudinary.ts` - NEW FILE
- `app/api/user/profile/route.ts` - Full implementation
- `prisma/schema.prisma` - Add avatarUrl to User if missing

**Acceptance Criteria:**
- [ ] Cloudinary account created
- [ ] Avatar upload works
- [ ] Images optimized automatically
- [ ] Avatar URL stored in database
- [ ] Profile page shows uploaded avatar
- [ ] File size validation (max 5MB)

**Reference:** See `makeconnections.md` lines 700-795 for implementation guide

---

## ✅ COMPLETED FEATURES

### User Preferences System
**Status:** ✅ COMPLETE
**Implementation:** PostgreSQL with debounced sync, localStorage fallback

**Features:**
- Real-time preference updates
- Debounced 2-second save to PostgreSQL
- Immediate localStorage persistence
- Category-based preferences (currency, timezone, theme, language)
- Notification preferences
- Trading preferences
- Favorite tokens tracking

**Files:**
- `lib/user-preferences-context.tsx` - React context with sync logic
- `app/api/preferences/route.ts` - API endpoints (GET, POST, DELETE)
- `prisma/schema.prisma` - UserPreferences model

---

### Portfolio Management
**Status:** ✅ COMPLETE
**Implementation:** Full CRUD with CoinGecko price fetching

**Features:**
- PostgreSQL storage of holdings
- CSV/JSON import support
- Live price updates (CoinGecko API)
- Total value calculation
- P&L tracking
- Allocation percentages
- Position tracker for leveraged positions

**Files:**
- `app/api/portfolio/route.ts` - Portfolio CRUD
- `app/api/portfolio/refresh/route.ts` - Price refresh
- `components/PortfolioImportModal.tsx` - Import UI
- `components/PositionTracker.tsx` - Position tracking
- `prisma/schema.prisma` - Portfolio and PortfolioHolding models

---

### Push Notifications (Client-Side)
**Status:** ✅ COMPLETE (Client), ⚠️ PARTIAL (Server)

**Features:**
- Firebase FCM client setup complete
- Service worker registered
- Push token collection
- Permission handling
- Notification center UI
- Badge count updates
- Notification history
- Category filtering

**Files:**
- `lib/push-notifications.ts` - FCM client logic
- `public/firebase-messaging-sw.js` - Service worker
- `components/NotificationCenter.tsx` - Notification UI
- `app/api/notifications/` - API routes (partial)

**Remaining:** Server-side Firebase Admin setup (Task 1.4)

---

### Settings UI
**Status:** ✅ COMPLETE (UI), ⚠️ PARTIAL (Backend)

**Features:**
- Security settings modal (password, 2FA, sessions, biometric)
- Notification settings modal (all preferences)
- Currency settings modal (display preferences)
- Subscription settings page
- All forms and UI components complete

**Files:**
- `components/settings/SecuritySettingsModal.tsx` - Full UI
- `components/settings/NotificationSettingsModal.tsx` - Full UI
- `components/settings/CurrencySettingsModal.tsx` - Full UI
- `app/settings/subscription/page.tsx` - Subscription UI

**Remaining:** Backend API implementations (Phases 1-2)

---

### Authentication System
**Status:** ✅ COMPLETE
**Implementation:** NextAuth with Discord OAuth

**Features:**
- Discord OAuth login
- Server membership validation
- JWT session management
- PostgreSQL session storage
- React context wrapper
- Premium access checking

**Files:**
- `lib/auth.ts` - NextAuth configuration
- `lib/auth-context.tsx` - React context
- `app/api/auth/[...nextauth]/route.ts` - NextAuth routes

---

### Analyst Data System
**Status:** ✅ COMPLETE
**Implementation:** Redis caching with n8n workflow

**Features:**
- n8n webhook ingestion (Discord/Twitter)
- OpenAI GPT-4 analysis for long posts
- Token extraction and routing
- Chart data extraction
- Redis storage with indexes
- Mock/Real data toggle (cookie-based)

**Files:**
- `lib/redis.ts` - Redis service
- `lib/workflow.ts` - Post processing
- `lib/analystDataSource.ts` - Data source toggle
- `lib/serverData.ts` - Server-side Redis fetching
- n8n workflow JSON - Complete

---

## 🔧 TECHNICAL DEBT & CODE QUALITY

### Lint Issues: 31 Total (15 errors, 16 warnings)
**Priority:** 🔵 LOW (non-breaking, cosmetic)

#### Quick Wins (5 minutes):
- Remove unused imports: `useEffect`, `router`, `savePreferences`, `showSuccess`
- Fix apostrophe: `You're` → `You&apos;re`
- Remove unused eslint-disable directive

#### Medium Effort (20 minutes):
- Replace `<img>` with Next.js `<Image />` in profile page
- Type the reduce function in `RecentActivityFeed.tsx:47`

#### Large Refactor (1-2 hours):
- Add proper TypeScript interfaces for `lib/workflow.ts` (6 `any` types)
- Add NextAuth type definitions to `lib/auth.ts` (3 `any` types)
- Type Redis methods in `lib/redis.ts` (1 `any` type)

**Decision:** Safe to defer until after MVP launch. These don't affect functionality.

---

## 💰 COST MIGRATION PATH

### Phase 1: Launch (Month 1-3) → **$0/month**

**Free Tier Services:**
- Supabase PostgreSQL (500MB, 50K MAU)
- Vercel KV / Redis (256MB, 3K commands/day - Upstash-powered)
- CoinGecko Demo (10K API calls/month)
- CoinCap (unlimited backup)
- RSS Feeds (unlimited)
- Firebase FCM (unlimited push notifications)
- Cloudinary (25 credits/month)
- Abstract API (20K geolocation/month)
- Stripe (no monthly fee, 2.9% + $0.30 per transaction)

**Capacity:** 500-1,000 active users, 10K price updates/month

**Upgrade Triggers:**
- Hit 3K Vercel KV commands/day (upgrade to Vercel Pro: $20/month for 100K/day)
- Hit 10K CoinGecko API calls
- 500MB PostgreSQL database full
- Need historical price data

---

### Phase 2: Growth (Month 4-6) → **$40-70/month**

**Paid Services:**
- Neon PostgreSQL Launch: $19/month (10GB, better performance)
- Vercel Pro plan: $20/month (includes 100K KV commands/day, better limits)
- CryptoPanic Pro: $9/month (better news API)
- Abstract API Pro: $9/month (50K geolocation)
- Still using CoinGecko free tier
- Still using Firebase FCM free

**Capacity:** 1,000-5,000 active users, still 10K price updates/month

**Upgrade Triggers:**
- Hit 10K CoinGecko API calls (need more price data)
- Need historical data for charts

---

### Phase 3: Scale (Month 7+) → **$200-250/month**

**Paid Services:**
- CoinGecko Analyst: $129/month (500K API calls, historical data)
- Neon Scale: $69/month (100GB, high availability)
- Vercel Pro: $20/month (100K KV commands/day, already included from Phase 2)
- CryptoPanic Pro: $9/month
- Abstract API Pro: $9/month
- Cloudinary Plus: $99/month (if needed)

**Capacity:** 5,000-20,000 active users, 500K price updates/month

**Next Triggers:**
- Need more than 500K CoinGecko calls
- International expansion (multi-region)

---

## 📋 ENVIRONMENT VARIABLES CHECKLIST

### Required NOW (Phase 1):
```bash
# Database (Critical)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Vercel KV / Redis (Critical) - Auto-populated by `vercel env pull`
KV_REST_API_URL=https://...  # From Vercel KV
KV_REST_API_TOKEN=...         # From Vercel KV

# Stripe (Critical)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase Admin (High Priority)
FIREBASE_ADMIN_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"..."}'

# Already Configured (Keep)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-secret
DISCORD_SERVER_ID=your-server-id
COINGECKO_API_KEY=CG-... (optional for free tier)
OPENAI_API_KEY=sk-... (for n8n workflow)
```

### Required Phase 2:
```bash
# Geolocation (for session management)
ABSTRACT_API_KEY=your-key
```

### Required Phase 3:
```bash
# Image hosting (for avatar uploads)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Optional (Future):
```bash
# Upgrade options
CRYPTOPANIC_API_KEY=your-key ($9/month)
APNS_KEY_ID=your-key (iOS push)
APNS_TEAM_ID=your-team (iOS push)
```

---

## 🚀 DEPLOYMENT READINESS

### Local Development: ✅ READY
- All features work with mock data
- Database migrations work locally
- Dev server stable
- Hot reload working

### Production Deployment: ❌ BLOCKED

**Critical Blockers:**
1. ❌ PostgreSQL not deployed to cloud (Supabase)
2. ❌ Redis not deployed to cloud (Upstash)
3. ❌ Stripe integration incomplete (revenue blocker)
4. ❌ Firebase Admin not initialized (notifications incomplete)

**Minimum Viable Product (MVP) Requires:**
- [ ] PostgreSQL deployed to Supabase (Task 1.1)
- [ ] Redis deployed to Upstash (Task 1.2)
- [ ] Stripe integration complete (Task 1.3)
- [ ] Firebase Admin complete (Task 1.4)
- [ ] Password change API implemented (Task 2.2)

**Nice-to-Have for Launch:**
- [ ] 2FA implemented (Task 2.1)
- [ ] Session management (Task 2.3)
- [ ] Real news data (Task 3.1)
- [ ] Real trading tools data (Task 3.2)

**Estimated Time to MVP:** 2 weeks (Tasks 1.1-1.4 + Task 2.2 = ~15-20 hours)

---

## 📊 IMPLEMENTATION PROGRESS

### Phase 1 (Week 1-2): **0% Complete** (0/4 tasks)
- [ ] Task 1.1: PostgreSQL to Supabase (30 min)
- [ ] Task 1.2: Redis to Upstash (30 min)
- [ ] Task 1.3: Stripe Integration (6-8 hours)
- [ ] Task 1.4: Firebase Admin (2-3 hours)

### Phase 2 (Week 3-4): **0% Complete** (0/3 tasks)
- [ ] Task 2.1: 2FA (4-6 hours)
- [ ] Task 2.2: Password Change (1-2 hours)
- [ ] Task 2.3: Session Management (3-4 hours)

### Phase 3 (Week 5-6): **0% Complete** (0/4 tasks)
- [ ] Task 3.1: RSS News (3-4 hours)
- [ ] Task 3.2: Trading Tools Data (4-5 hours)
- [ ] Task 3.3: Airdrop Scraping (4-6 hours)
- [ ] Task 3.4: Image Uploads (2-3 hours)

**Total Estimated Time:** 30-40 hours across 6 weeks

---

## 🎯 NEXT STEPS (Priority Order)

### This Week (Critical):
1. **Deploy databases** (1 hour total)
   - [ ] Supabase PostgreSQL (30 min)
   - [ ] Upstash Redis (30 min)

2. **Enable payments** (6-8 hours)
   - [ ] Setup Stripe account
   - [ ] Implement subscription system
   - [ ] Test subscription flow

3. **Complete notifications** (2-3 hours)
   - [ ] Setup Firebase Admin
   - [ ] Test notification sending

**Total Time:** 9-12 hours (can be done in 2-3 days)

### Next Week (Important):
4. **Security features** (5-8 hours)
   - [ ] Password change API
   - [ ] 2FA implementation

5. **Session management** (3-4 hours)
   - [ ] Device tracking
   - [ ] Session termination

### Following Weeks (Nice-to-Have):
6. **Content & data** (11-15 hours)
   - [ ] RSS news feed
   - [ ] Trading tools real data
   - [ ] Airdrop scraping
   - [ ] Image uploads

---

## 📚 REFERENCE DOCUMENTS

- **makeconnections.md** - Complete API integration guide with links, pricing, documentation
- **CLAUDE.md** - Architecture overview, development patterns, gotchas
- **WORKFLOW_DOCUMENTATION.md** - n8n workflow details
- **DATABASE_CONNECTION.md** - Redis schema and query patterns
- **prisma/schema.prisma** - Current database schema
- **package.json** - Available npm scripts

---

## 🔗 QUICK LINKS

### Documentation
- Supabase Docs: https://supabase.com/docs
- Vercel KV Docs: https://vercel.com/docs/storage/vercel-kv
- Upstash Redis Docs: https://docs.upstash.com/redis (Vercel KV uses this SDK)
- Stripe Docs: https://docs.stripe.com/
- Firebase Admin: https://firebase.google.com/docs/admin/setup
- CoinGecko API: https://www.coingecko.com/en/api/documentation

### Account Creation
- Supabase: https://supabase.com/dashboard
- Vercel: https://vercel.com/dashboard (for KV, deployments)
- Stripe: https://dashboard.stripe.com/register
- Firebase Console: https://console.firebase.google.com
- Abstract API: https://app.abstractapi.com
- Cloudinary: https://cloudinary.com/users/register_free

### Status Pages
- Vercel Status: https://www.vercel-status.com/
- Stripe Status: https://status.stripe.com/
- Firebase Status: https://status.firebase.google.com/
- Supabase Status: https://status.supabase.com/

---

*Last Updated: 2025-11-05*
*For detailed implementation prompts, see `prompts.md`*
*For API connection details, see `makeconnections.md`*

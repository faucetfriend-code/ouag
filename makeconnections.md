# API Connections Guide - Unity Oracle Aggregator

**Priority: FREE → Low Cost → Premium**

This document catalogs all API connections needed to complete the Unity Oracle Aggregator app, organized by cost from FREE to most expensive.

---

## 🎯 Quick Reference Table

| Category | FREE Option | Low-Cost Option | Premium Option | Status |
|----------|-------------|-----------------|----------------|--------|
| **Market Data** | CoinGecko Demo (10K/mo) | CoinGecko Analyst ($129/mo) | Bloomberg Terminal ($2K+/mo) | ⚠️ Using free |
| **Payment** | Stripe (2.9% only) | Paddle (5% + $0.50) | - | ❌ Not setup |
| **News** | RSS Feeds (unlimited) | CryptoPanic Pro ($9/mo) | NewsAPI Pro ($449/mo) | ❌ Mock data |
| **Airdrops** | Web scraping (free) | Manual curation | - | ❌ Mock data |
| **Push Notifications** | Firebase FCM (unlimited) | OneSignal (unlimited) | - | ✅ Partial |
| **2FA** | otplib npm (free) | Twilio Authy ($0.05/auth) | - | ❌ Not setup |
| **Image Hosting** | Cloudinary (25 credits/mo) | Vercel Blob ($0.30/GB) | AWS S3 | ❌ Not setup |
| **Geolocation** | Abstract API (20K/mo) | ipapi.co ($9/mo) | MaxMind ($600/yr) | ❌ Not setup |
| **PostgreSQL** | Supabase (500MB free) | Neon Launch ($19/mo) | AWS RDS ($50+/mo) | ⚠️ Local only |
| **Redis** | Upstash (256MB free) | Upstash Pro ($0.20/100K) | Redis Cloud ($50+/mo) | ⚠️ Local only |

---

## 💰 Recommended FREE Stack (Launch with $0/month)

Your app can run **completely free** for the first 500-1000 users:

```bash
# Market Data
✅ CoinGecko Demo API (10,000 calls/month, 30/min)
✅ CoinCap API (unlimited backup, no signup required)
✅ Binance Public API (unlimited for public endpoints)

# Content
✅ RSS Feeds (CoinDesk, CoinTelegraph, Decrypt - unlimited)
✅ Web Scraping (airdrops.io, airdropalert.com)

# Infrastructure
✅ Firebase FCM (unlimited push notifications)
✅ Supabase PostgreSQL (500MB, 50K MAU)
✅ Upstash Redis (256MB, 10K commands/day)

# Features
✅ otplib npm (2FA - unlimited)
✅ Cloudinary (25 credits/month for avatars)
✅ Abstract API (20K geolocation requests/month)
✅ Stripe (no monthly fee, pay 2.9% + $0.30 per transaction only)

# Total Monthly Cost: $0
# Capacity: 500-1000 active users, 10K price updates/month
```

---

## 📋 Detailed API Options by Category

### 1. PAYMENT PROCESSING & SUBSCRIPTIONS

#### Status: ❌ NOT IMPLEMENTED
**Files:** `app/api/billing/`, `app/api/subscription/`

---

#### **Option A: Stripe** ⭐ RECOMMENDED

**Cost:** FREE (pay 2.9% + $0.30 per transaction only)

**Why Stripe:**
- ✅ NO monthly fee (only pay when you earn)
- ✅ Best documentation and developer experience
- ✅ Built-in subscription management
- ✅ Handles tax compliance (Stripe Tax)
- ✅ PCI compliance handled automatically
- ✅ Webhooks for all events

**Links:**
- 🌐 Homepage: https://stripe.com
- 📖 Docs: https://docs.stripe.com/
- 📖 Subscriptions: https://docs.stripe.com/billing/subscriptions/overview
- 💰 Pricing: https://stripe.com/pricing
- 🔑 Sign Up: https://dashboard.stripe.com/register
- 🔧 Node SDK: https://www.npmjs.com/package/stripe

**Implementation:**
```bash
npm install stripe
```

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_test_...  # Get from dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From webhook endpoint setup
```

**Features Needed:**
- Create customer on user registration
- Create subscription with trial period
- Handle subscription upgrades/downgrades
- Process payment methods
- Webhook handlers for:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

**Database Changes:**
```prisma
model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId  String   @unique
  stripeSubscriptionId String? @unique
  stripePriceId     String?
  status            String   // active, canceled, past_due, trialing
  currentPeriodEnd  DateTime?
  cancelAtPeriodEnd Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Priority:** 🔴 CRITICAL (enables revenue)

---

#### **Option B: Paddle**

**Cost:** 5% + $0.50 per transaction (Merchant of Record)

**Why Paddle:**
- Handles all sales tax globally (you never deal with tax)
- Merchant of Record (they're the seller, you're the vendor)
- All-in-one platform

**Drawbacks:**
- Higher fees than Stripe
- Less flexible than Stripe

**Links:**
- 🌐 Homepage: https://www.paddle.com
- 📖 Docs: https://developer.paddle.com/
- 💰 Pricing: https://www.paddle.com/pricing

**Priority:** 🟡 ALTERNATIVE

---

#### **Option C: Lemon Squeezy**

**Cost:** 5% + $0.50 per transaction

**Note:** Acquired by Stripe in 2025, may integrate fully soon

**Links:**
- 🌐 Homepage: https://www.lemonsqueezy.com
- 📖 Docs: https://docs.lemonsqueezy.com/

**Priority:** 🟡 ALTERNATIVE

---

#### **Option D: BTCPay Server** (Crypto-only)

**Cost:** FREE (self-hosted, crypto payments only)

**Why BTCPay:**
- Zero fees (direct crypto payments)
- Bitcoin, Lightning, altcoins
- Self-hosted (full control)

**Drawbacks:**
- Requires server setup and maintenance
- No fiat support
- More complex than Stripe

**Links:**
- 🌐 Homepage: https://btcpayserver.org
- 📖 Docs: https://docs.btcpayserver.org/

**Priority:** 🔵 NICHE (for crypto-native users)

---

### 2. CRYPTOCURRENCY MARKET DATA

#### Status: ⚠️ PARTIAL (Portfolio uses CoinGecko free, Trading Tools use mock data)
**Files:** `lib/toolsData.ts`, `app/api/portfolio/refresh/route.ts`

---

#### **Option A: CoinGecko API** ⭐ RECOMMENDED

**Free Tier:** Demo Plan
- ✅ 10,000 calls/month
- ✅ 30 calls/minute
- ✅ 1,000+ coins
- ✅ Price, volume, market cap
- ❌ No historical data beyond 1 year
- ❌ No commercial use officially

**Paid Tiers:**
- **Analyst:** $129/month → 500K calls/month, historical data, commercial use
- **Lite:** $499/month → 1M calls/month, priority support
- **Pro:** $999/month → 2M calls/month

**Links:**
- 🌐 Homepage: https://www.coingecko.com/en/api
- 📖 Docs: https://www.coingecko.com/en/api/documentation
- 💰 Pricing: https://www.coingecko.com/en/api/pricing
- 🔑 Sign Up: https://www.coingecko.com/en/developers/dashboard
- 🔧 Node Client: https://www.npmjs.com/package/coingecko-api-v3

**Environment Variables:**
```bash
COINGECKO_API_KEY=CG-...  # Free tier: no key needed, Pro: from dashboard
```

**Endpoints Needed:**
```javascript
// Current prices (batch)
GET /api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd

// Top gainers/losers
GET /api/v3/coins/markets?vs_currency=usd&order=percent_change_24h_desc&per_page=10

// Historical data (Pro only)
GET /api/v3/coins/{id}/market_chart?vs_currency=usd&days=30

// Trending coins
GET /api/v3/search/trending
```

**Priority:** 🔴 HIGH (upgrade to Analyst at 10K calls/month)

---

#### **Option B: CoinCap API** ⭐ FREE BACKUP

**Free Tier:** Unlimited
- ✅ Completely FREE, no signup
- ✅ No rate limits (reasonable use)
- ✅ Real-time prices
- ✅ 2,000+ assets
- ❌ Less comprehensive than CoinGecko

**Links:**
- 🌐 Homepage: https://coincap.io
- 📖 Docs: https://docs.coincap.io/
- 🔧 No API key needed

**Example:**
```javascript
// Get Bitcoin price
GET https://api.coincap.io/v2/assets/bitcoin

// Top assets
GET https://api.coincap.io/v2/assets?limit=10
```

**Priority:** 🟢 USE AS BACKUP (no signup, unlimited)

---

#### **Option C: Binance Public API** (FREE)

**Free Tier:** Unlimited (public endpoints)
- ✅ Real-time prices
- ✅ 24h ticker data
- ✅ Order book data
- ✅ Funding rates (futures)
- ❌ Only Binance-listed coins
- ❌ Complex API

**Links:**
- 🌐 Homepage: https://www.binance.com/en/binance-api
- 📖 Docs: https://binance-docs.github.io/apidocs/spot/en/
- 📖 Futures Docs: https://binance-docs.github.io/apidocs/futures/en/

**Use Case:** Funding rates for Trading Tools

**Example:**
```javascript
// Funding rates (futures)
GET https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT

// 24h ticker
GET https://api.binance.com/api/v3/ticker/24hr
```

**Priority:** 🟢 SUPPLEMENT (for funding rates)

---

#### **Option D: CoinMarketCap API**

**Free Tier:** Basic
- ✅ 10,000 calls/month
- ✅ 9 endpoints
- ❌ Limited features vs CoinGecko

**Paid Tiers:**
- **Startup:** $79/month → 14 endpoints, 100K calls
- **Hobbyist:** $349/month → 18 endpoints, 300K calls

**Links:**
- 🌐 Homepage: https://coinmarketcap.com/api/
- 📖 Docs: https://coinmarketcap.com/api/documentation/v1/
- 💰 Pricing: https://coinmarketcap.com/api/pricing/

**Priority:** 🟡 ALTERNATIVE (CoinGecko is better for free tier)

---

### 3. NEWS AGGREGATION

#### Status: ❌ MOCK DATA
**Files:** `lib/newsData.ts`, `app/news/page.tsx`

---

#### **Option A: RSS Feeds** ⭐ RECOMMENDED FREE

**Cost:** FREE (unlimited)

**Sources:**
- **CoinDesk:** https://www.coindesk.com/arc/outboundfeeds/rss/
- **CoinTelegraph:** https://cointelegraph.com/rss
- **Decrypt:** https://decrypt.co/feed
- **The Block:** https://www.theblock.co/rss.xml
- **Bitcoin Magazine:** https://bitcoinmagazine.com/.rss/full/

**Implementation:**
```bash
npm install rss-parser
```

**Example:**
```javascript
import Parser from 'rss-parser';

const parser = new Parser();
const feeds = [
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://cointelegraph.com/rss',
  'https://decrypt.co/feed'
];

// Fetch and merge all feeds
const allNews = await Promise.all(
  feeds.map(url => parser.parseURL(url))
);
```

**Priority:** 🟢 IMPLEMENT FIRST (free, unlimited)

---

#### **Option B: CryptoPanic API**

**Free Tier:** Limited
- ✅ Aggregates news from 100+ sources
- ✅ Sentiment analysis included
- ✅ RSS feed: https://cryptopanic.com/news/rss
- ❌ API requires paid plan for full access

**Paid Tier:** Pro
- **Cost:** $9/month
- ✅ API access
- ✅ Filtering by currency
- ✅ Historical data

**Links:**
- 🌐 Homepage: https://cryptopanic.com
- 📖 API Docs: https://cryptopanic.com/developers/api/
- 💰 Pricing: https://cryptopanic.com/developers/api/
- 🔑 Sign Up: https://cryptopanic.com/accounts/signup/

**Environment Variables:**
```bash
CRYPTOPANIC_API_KEY=...  # From cryptopanic.com/developers/
```

**Priority:** 🟡 UPGRADE LATER ($9/month when RSS isn't enough)

---

#### **Option C: NewsAPI.org**

**Free Tier:** Developer
- ✅ 100 requests/day
- ✅ Search crypto news
- ❌ Only news from last 30 days
- ❌ Commercial use forbidden

**Paid Tier:** Business
- **Cost:** $449/month
- ✅ 100K requests/day
- ✅ Commercial use

**Links:**
- 🌐 Homepage: https://newsapi.org
- 📖 Docs: https://newsapi.org/docs
- 💰 Pricing: https://newsapi.org/pricing

**Priority:** 🔴 TOO EXPENSIVE (use RSS instead)

---

### 4. AIRDROP TRACKING

#### Status: ❌ MOCK DATA
**Files:** `lib/airdropsData.ts`, `app/airdrops/page.tsx`

---

#### **Option A: Web Scraping** ⭐ RECOMMENDED FREE

**Cost:** FREE (requires maintenance)

**Sources:**
- **Airdrops.io:** https://airdrops.io (600+ active airdrops)
- **Airdrop Alert:** https://airdropalert.com
- **CoinMarketCap Airdrops:** https://coinmarketcap.com/airdrop/

**Implementation:**
```bash
npm install cheerio axios
```

**n8n Workflow:**
- Schedule: Every 6 hours
- HTTP Request to scrape websites
- Parse HTML with Cheerio
- AI verification (GPT-4) to detect scams
- Store in Redis

**Example:**
```javascript
import axios from 'axios';
import * as cheerio from 'cheerio';

const { data } = await axios.get('https://airdrops.io');
const $ = cheerio.load(data);

// Parse airdrop cards
$('.airdrop-card').each((i, elem) => {
  const title = $(elem).find('.title').text();
  const value = $(elem).find('.value').text();
  const endDate = $(elem).find('.end-date').text();
  // ... store in Redis
});
```

**Priority:** 🟢 IMPLEMENT (free, effective)

---

#### **Option B: Manual Curation**

**Cost:** FREE (labor intensive)

**Process:**
- Team manually verifies airdrops
- Community submissions via form
- Highest quality but slowest

**Priority:** 🟡 SUPPLEMENT (for quality control)

---

#### **Option C: Airdrop King API**

**Note:** Limited free tier, but no comprehensive paid API exists for airdrops

**Priority:** 🔵 EXPERIMENTAL

---

### 5. PUSH NOTIFICATIONS

#### Status: ✅ CLIENT-SIDE COMPLETE, ⚠️ SERVER-SIDE INCOMPLETE
**Files:** `lib/push-notifications.ts`, `app/api/notifications/send/route.ts`

---

#### **Option A: Firebase Cloud Messaging (FCM)** ⭐ ALREADY USING

**Cost:** FREE (unlimited)

**Current Status:**
- ✅ Client-side setup complete
- ✅ Service worker registered
- ✅ Push tokens being collected
- ❌ Server-side Firebase Admin not initialized

**What's Needed:**
1. Firebase Admin SDK setup
2. Service account JSON key
3. Send notification endpoint

**Links:**
- 🌐 Homepage: https://firebase.google.com/products/cloud-messaging
- 📖 Docs: https://firebase.google.com/docs/cloud-messaging
- 📖 Admin SDK: https://firebase.google.com/docs/admin/setup
- 🔑 Console: https://console.firebase.google.com

**Implementation:**
```bash
npm install firebase-admin
```

**Environment Variables:**
```bash
FIREBASE_ADMIN_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...",...}'
```

**Get Service Account:**
1. Go to https://console.firebase.google.com
2. Project Settings → Service Accounts
3. Generate new private key (downloads JSON)
4. Copy entire JSON as single-line string to .env

**Server-Side Code:**
```javascript
import admin from 'firebase-admin';

// Initialize once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
    )
  });
}

// Send notification
await admin.messaging().send({
  token: userPushToken,
  notification: {
    title: 'Price Alert',
    body: 'BTC reached $50,000!'
  },
  webpush: {
    fcmOptions: {
      link: 'https://yourapp.com/btc'
    }
  }
});
```

**Priority:** 🔴 HIGH (complete existing integration)

---

#### **Option B: Apple Push Notification Service (APNs)**

**Cost:** FREE (requires $99/year Apple Developer account)

**When Needed:** iOS app launch via Capacitor

**Links:**
- 📖 Docs: https://developer.apple.com/documentation/usernotifications

**Environment Variables:**
```bash
APNS_KEY_ID=...
APNS_TEAM_ID=...
APNS_AUTH_KEY=...  # .p8 file from Apple Developer
```

**Integration:** Works through Firebase Admin SDK

**Priority:** 🟡 LATER (when launching iOS app)

---

#### **Option C: OneSignal**

**Cost:** FREE (unlimited notifications)

**Why OneSignal:**
- Better analytics dashboard than Firebase
- Easier setup
- Segmentation and A/B testing

**Drawback:**
- Already using Firebase, switching adds complexity

**Links:**
- 🌐 Homepage: https://onesignal.com
- 📖 Docs: https://documentation.onesignal.com/

**Priority:** 🔵 ALTERNATIVE (stick with Firebase)

---

### 6. TWO-FACTOR AUTHENTICATION (2FA)

#### Status: ❌ NOT IMPLEMENTED (placeholder exists)
**Files:** `app/api/security/two-factor/route.ts`, `components/settings/SecuritySettingsModal.tsx`

---

#### **Option A: otplib** ⭐ RECOMMENDED FREE

**Cost:** FREE (npm library)

**Why otplib:**
- ✅ Modern TypeScript library
- ✅ Well-maintained (active in 2024-2025)
- ✅ Works with Google Authenticator, Authy, 1Password
- ✅ No external API calls (fully local)

**Links:**
- 📖 GitHub: https://github.com/yeojz/otplib
- 📖 Docs: https://yeojz.github.io/otplib/
- 🔧 NPM: https://www.npmjs.com/package/otplib

**Implementation:**
```bash
npm install otplib qrcode
```

**Example:**
```javascript
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Generate secret for user
const secret = authenticator.generateSecret();

// Create otpauth URL
const user = 'user@example.com';
const service = 'Unity Oracle';
const otpauth = authenticator.keyuri(user, service, secret);

// Generate QR code
const qrCodeDataURL = await QRCode.toDataURL(otpauth);

// Verify code
const isValid = authenticator.verify({
  token: userEnteredCode,
  secret: secret
});
```

**Database Changes:**
```prisma
model User {
  // ... existing fields
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?  // Store encrypted
}
```

**Priority:** 🔴 HIGH (security best practice)

---

#### **Option B: Speakeasy**

**Cost:** FREE (npm library)

**Status:** Marked as unmaintained but stable

**Links:**
- 📖 GitHub: https://github.com/speakeasyjs/speakeasy
- 🔧 NPM: https://www.npmjs.com/package/speakeasy

**Priority:** 🟡 ALTERNATIVE (use otplib instead - more modern)

---

#### **Option C: Twilio Authy API** (SMS-based)

**Cost:** $0.05 per authentication

**Why Authy:**
- SMS-based 2FA (easier for non-tech users)
- Phone call backup
- Push notifications via Authy app

**Drawback:**
- Costs money per auth
- Requires phone numbers

**Links:**
- 🌐 Homepage: https://www.twilio.com/authy
- 📖 Docs: https://www.twilio.com/docs/authy

**Priority:** 🔵 PREMIUM FEATURE (for enterprise plan)

---

### 7. IMAGE HOSTING (User Avatars)

#### Status: ❌ NOT IMPLEMENTED
**Files:** `app/api/user/profile/route.ts`

---

#### **Option A: Cloudinary** ⭐ RECOMMENDED FREE

**Free Tier:**
- ✅ 25 credits/month (flexible allocation)
- ✅ Can split: ~5K transformations + 10GB storage + 10GB bandwidth
- ✅ Image optimization, resizing, CDN
- ✅ Face detection (for avatar cropping)

**Paid Tier:**
- **Plus:** $99/month → 75 credits

**Links:**
- 🌐 Homepage: https://cloudinary.com
- 📖 Docs: https://cloudinary.com/documentation
- 💰 Pricing: https://cloudinary.com/pricing
- 🔑 Sign Up: https://cloudinary.com/users/register_free
- 🔧 Node SDK: https://www.npmjs.com/package/cloudinary

**Implementation:**
```bash
npm install cloudinary
```

**Environment Variables:**
```bash
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Example:**
```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload avatar
const result = await cloudinary.uploader.upload(imageBuffer, {
  folder: 'avatars',
  width: 200,
  height: 200,
  crop: 'fill',
  gravity: 'face'
});

// result.secure_url is the avatar URL
```

**Priority:** 🟢 MEDIUM (when user profiles are enhanced)

---

#### **Option B: Vercel Blob Storage**

**Free Tier:**
- ✅ 1GB storage
- ✅ 10GB bandwidth/month

**Paid:** $0.30/GB storage, $0.15/GB bandwidth

**Links:**
- 📖 Docs: https://vercel.com/docs/storage/vercel-blob
- 💰 Pricing: https://vercel.com/docs/storage/vercel-blob/usage-and-pricing

**Implementation:**
```bash
npm install @vercel/blob
```

**Priority:** 🟡 ALTERNATIVE (if using Vercel)

---

#### **Option C: Supabase Storage**

**Free Tier:**
- ✅ 1GB storage
- ✅ 10GB bandwidth/month
- ❌ 50MB file size limit

**Links:**
- 📖 Docs: https://supabase.com/docs/guides/storage

**Priority:** 🟡 ALTERNATIVE (if using Supabase)

---

### 8. GEOLOCATION (Session Management)

#### Status: ❌ NOT IMPLEMENTED
**Files:** `app/api/security/sessions/route.ts`

---

#### **Option A: Abstract API** ⭐ RECOMMENDED FREE

**Free Tier:**
- ✅ 20,000 requests/month
- ✅ City, region, country, timezone
- ✅ ISP information

**Paid Tier:**
- **Starter:** $9/month → 50K requests

**Links:**
- 🌐 Homepage: https://www.abstractapi.com/ip-geolocation-api
- 📖 Docs: https://www.abstractapi.com/api/ip-geolocation-api#docs
- 💰 Pricing: https://www.abstractapi.com/api/ip-geolocation-api#pricing
- 🔑 Sign Up: https://app.abstractapi.com/users/signup

**Environment Variables:**
```bash
ABSTRACT_API_KEY=...
```

**Example:**
```javascript
const response = await fetch(
  `https://ipgeolocation.abstractapi.com/v1/?api_key=${key}&ip_address=${ip}`
);
const { city, country, timezone } = await response.json();
```

**Priority:** 🟢 MEDIUM (for session management)

---

#### **Option B: ipapi.co**

**Free Tier:**
- ✅ 1,000 requests/day (~30K/month)
- ❌ Not for production use (ToS)

**Paid Tier:**
- **Basic:** $9/month → 5K/day

**Links:**
- 🌐 Homepage: https://ipapi.co
- 📖 Docs: https://ipapi.co/api/

**Priority:** 🟡 ALTERNATIVE

---

#### **Option C: ua-parser-js** (Device Detection) ⭐ FREE

**Cost:** FREE (npm library)

**Use:** Parse browser/device information from User-Agent

**Links:**
- 📖 GitHub: https://github.com/faisalman/ua-parser-js
- 🔧 NPM: https://www.npmjs.com/package/ua-parser-js

**Implementation:**
```bash
npm install ua-parser-js
```

**Example:**
```javascript
import { UAParser } from 'ua-parser-js';

const parser = new UAParser(request.headers.get('user-agent'));
const result = parser.getResult();

// { browser: { name: "Chrome", version: "120.0" },
//   os: { name: "Windows", version: "10" },
//   device: { type: "desktop" } }
```

**Priority:** 🟢 IMPLEMENT (free, essential for session tracking)

---

### 9. DATABASE HOSTING

#### Status: ⚠️ LOCAL ONLY (needs cloud deployment)

---

#### **PostgreSQL Options**

#### **Option A: Supabase** ⭐ RECOMMENDED FREE

**Free Tier:**
- ✅ 500MB database
- ✅ 50K monthly active users
- ✅ Unlimited API requests
- ✅ Social auth included
- ✅ Real-time subscriptions
- ✅ Auto backups

**Paid Tier:**
- **Pro:** $25/month → 8GB database, 100K MAU

**Links:**
- 🌐 Homepage: https://supabase.com
- 📖 Docs: https://supabase.com/docs
- 💰 Pricing: https://supabase.com/pricing
- 🔑 Sign Up: https://supabase.com/dashboard

**Environment Variables:**
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Priority:** 🔴 HIGH (best free tier for MVP)

---

#### **Option B: Neon**

**Free Tier:**
- ✅ 3GiB total storage (across all branches)
- ✅ Scale-to-zero (pause after 5 min inactivity)
- ✅ Serverless Postgres

**Paid Tier:**
- **Launch:** $19/month → 10GiB

**Links:**
- 🌐 Homepage: https://neon.tech
- 📖 Docs: https://neon.tech/docs
- 💰 Pricing: https://neon.tech/pricing

**Priority:** 🟡 ALTERNATIVE (upgrade path from Supabase)

---

#### **Option C: Railway**

**Free Tier:**
- ✅ $5 free credit/month
- ❌ Requires credit card

**Paid:** Pay-as-you-go

**Links:**
- 🌐 Homepage: https://railway.app
- 📖 Docs: https://docs.railway.app

**Priority:** 🟡 ALTERNATIVE

---

#### **Redis Options**

#### **Option A: Upstash** ⭐ RECOMMENDED FREE

**Free Tier:**
- ✅ 256MB storage
- ✅ 10,000 commands/day
- ✅ Global edge network
- ✅ Durable storage (not just cache)

**Paid Tier:**
- Pay-as-you-go: $0.20 per 100K commands (max $120/month)

**Links:**
- 🌐 Homepage: https://upstash.com
- 📖 Docs: https://docs.upstash.com/redis
- 💰 Pricing: https://upstash.com/pricing
- 🔑 Sign Up: https://console.upstash.com

**Environment Variables:**
```bash
REDIS_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

**Priority:** 🔴 HIGH (best free Redis for production)

---

#### **Option B: Redis Cloud**

**Free Tier:**
- ✅ 30MB storage
- ❌ Too small for production

**Paid Tier:**
- **Essentials:** $50/month → 250MB

**Links:**
- 🌐 Homepage: https://redis.com/cloud/
- 📖 Docs: https://docs.redis.com/latest/

**Priority:** 🔴 TOO SMALL FREE TIER (use Upstash)

---

#### **Option C: Vercel KV** (Powered by Upstash)

**Free Tier:**
- ✅ 256MB storage
- ✅ 3,000 commands/day (less than Upstash direct)

**Links:**
- 📖 Docs: https://vercel.com/docs/storage/vercel-kv

**Priority:** 🟡 ALTERNATIVE (if using Vercel, otherwise use Upstash directly)

---

### 10. SESSION MANAGEMENT / ANALYTICS

#### Status: ❌ MOCK DATA
**Files:** `app/api/security/sessions/route.ts`

---

#### **Implementation: Custom (FREE)**

**Use existing tools:**
- ✅ NextAuth Session table (already exists)
- ✅ ua-parser-js (device detection) - FREE
- ✅ Abstract API (geolocation) - 20K/month FREE

**What to Build:**
```typescript
// Extend existing Session model
model Session {
  // ... existing NextAuth fields
  deviceType    String?   // From ua-parser-js
  browser       String?   // From ua-parser-js
  os            String?   // From ua-parser-js
  ipAddress     String?
  location      String?   // From Abstract API: "San Francisco, CA, US"
  lastActivity  DateTime  @updatedAt
}
```

**Features:**
- Track all active sessions
- Display device, browser, location
- "Terminate Session" button
- "Terminate All Other Sessions" button

**Priority:** 🟡 MEDIUM (security enhancement)

---

## 📊 Cost Migration Path

### **Phase 1: Launch (Month 1-3)** → **$0/month**

**Services:**
- ✅ Supabase PostgreSQL (500MB free)
- ✅ Upstash Redis (256MB free)
- ✅ CoinGecko Demo (10K calls/month)
- ✅ CoinCap (unlimited backup)
- ✅ RSS Feeds (unlimited)
- ✅ Firebase FCM (unlimited)
- ✅ Cloudinary (25 credits/month)
- ✅ Abstract API (20K/month)
- ✅ Stripe (no monthly fee, 2.9% per transaction)

**Capacity:**
- 500-1000 active users
- 10K price API calls/month
- ~10-20 subscription payments/month

**Upgrade Triggers:**
- Hit 10K CoinGecko API calls
- Hit 10K Redis commands/day
- Need historical price data
- 500MB database full

---

### **Phase 2: Growth (Month 4-6)** → **$40-70/month**

**Services:**
- 🔼 Neon Launch PostgreSQL: **$19/month**
- 🔼 Upstash Redis (pay-as-you-go): **~$5-15/month**
- 🔼 CryptoPanic Pro: **$9/month**
- 🔼 Abstract API Pro: **$9/month** (50K requests)
- ✅ CoinGecko Demo (still free)
- ✅ Firebase FCM (still free)
- ✅ Cloudinary free tier
- ✅ Stripe (2.9% per transaction)

**Capacity:**
- 1,000-5,000 active users
- Still using free CoinGecko (10K/month)
- 50K geolocation requests/month
- Better news aggregation

**Upgrade Triggers:**
- Hit 10K CoinGecko API calls
- Need more than 10K price updates/month
- Need historical data for charts

---

### **Phase 3: Scale (Month 7+)** → **$200-250/month**

**Services:**
- 🔼 **CoinGecko Analyst: $129/month** (500K calls, historical data)
- 🔼 Neon Scale PostgreSQL: **$69/month** (100GB, high availability)
- 🔼 Upstash Redis: **$20-40/month** (higher volume)
- ✅ CryptoPanic Pro: **$9/month**
- ✅ Abstract API Pro: **$9/month**
- ✅ Firebase FCM (still free)
- ✅ Cloudinary free tier or Plus ($99/month)
- ✅ Stripe (2.9% per transaction)

**Capacity:**
- 5,000-20,000 active users
- 500K price API calls/month
- Historical charts and analytics
- Production-grade infrastructure

**Next Triggers:**
- Need more than 500K CoinGecko calls → Upgrade to Lite ($499/month)
- International expansion → Add CDN, multi-region database

---

## 🎯 Implementation Priority

### **WEEK 1-2: Critical Infrastructure**

1. ✅ **Deploy PostgreSQL** (Supabase free tier)
   - Create account: https://supabase.com/dashboard
   - Create new project
   - Copy DATABASE_URL to .env
   - Run `npx prisma db push`

2. ✅ **Deploy Redis** (Upstash free tier)
   - Create account: https://console.upstash.com
   - Create Redis database
   - Copy REDIS_URL and token to .env
   - Update `lib/redis.ts` with Upstash connection

3. ✅ **Setup Stripe** (no cost until processing)
   - Create account: https://dashboard.stripe.com/register
   - Copy test keys to .env
   - Implement subscription endpoints
   - Add Subscription model to Prisma

4. ✅ **Complete Firebase Admin** (free)
   - Go to Firebase Console
   - Download service account JSON
   - Add to .env as FIREBASE_ADMIN_SERVICE_ACCOUNT
   - Implement send notification endpoint

**Blockers Removed:** Can now launch with payments and push notifications

---

### **WEEK 3-4: Core Features**

5. ✅ **Implement 2FA** (otplib - free)
   ```bash
   npm install otplib qrcode
   ```
   - Implement `/api/security/two-factor` endpoints
   - Add QR code generation
   - Test with Google Authenticator

6. ✅ **Password Change API** (bcrypt - already installed)
   - Implement `/api/auth/change-password`
   - Add current password verification
   - Hash new password with bcrypt

7. ✅ **RSS News Feed** (free)
   ```bash
   npm install rss-parser
   ```
   - Replace mock data in `lib/newsData.ts`
   - Create n8n workflow to fetch every hour
   - Store in Redis with timestamps

8. ✅ **Session Management** (ua-parser-js + Abstract API - free)
   ```bash
   npm install ua-parser-js
   ```
   - Extend Session model
   - Implement session tracking
   - Add terminate session endpoints

**Milestone:** App is fully functional with security features

---

### **WEEK 5-6: Content & Data**

9. ✅ **Trading Tools Data** (CoinGecko + Binance - free)
   - Replace mock data in `lib/toolsData.ts`
   - Use CoinGecko for top movers
   - Use Binance API for funding rates
   - Create n8n workflow for updates

10. ✅ **Airdrop Scraping** (cheerio - free)
    ```bash
    npm install cheerio axios
    ```
    - Create n8n workflow for web scraping
    - Parse airdrops.io every 6 hours
    - Store in Redis

11. ✅ **Image Uploads** (Cloudinary - free)
    ```bash
    npm install cloudinary
    ```
    - Setup Cloudinary account
    - Implement avatar upload in profile API
    - Add image optimization

**Milestone:** All content features working with free APIs

---

### **WEEK 7+: Enhancements**

12. ✅ **Upgrade to CryptoPanic API** ($9/month)
    - Better news aggregation
    - Sentiment analysis
    - Historical news

13. ✅ **Monthly P&L Tracking**
    - Implement `/api/monthly-pnl`
    - Calculate from portfolio history

14. ✅ **Privacy Settings**
    - GDPR compliance
    - Data export
    - Account deletion

---

## 📝 Implementation Checklist

### **Database Setup**

- [ ] Create Supabase account
- [ ] Create PostgreSQL database
- [ ] Add DATABASE_URL to .env
- [ ] Run `npx prisma db push`
- [ ] Create Upstash account
- [ ] Create Redis database
- [ ] Add REDIS_URL to .env
- [ ] Update `lib/redis.ts` connection string
- [ ] Test connection with `redis-cli` or dashboard

---

### **Payment System**

- [ ] Create Stripe account
- [ ] Add Stripe keys to .env (test mode)
- [ ] Install Stripe SDK: `npm install stripe`
- [ ] Add Subscription model to `prisma/schema.prisma`
- [ ] Run `npx prisma db push`
- [ ] Implement `/api/billing/payment-methods` (GET, POST, DELETE)
- [ ] Implement `/api/subscription` (GET, POST, PATCH, DELETE)
- [ ] Implement `/api/billing/invoices` (GET)
- [ ] Setup webhook endpoint `/api/webhooks/stripe`
- [ ] Configure webhook in Stripe dashboard
- [ ] Test subscription creation
- [ ] Test subscription cancellation
- [ ] Switch to live mode keys for production

---

### **Push Notifications**

- [ ] Go to Firebase Console
- [ ] Project Settings → Service Accounts
- [ ] Generate new private key (downloads JSON)
- [ ] Copy JSON content to .env as FIREBASE_ADMIN_SERVICE_ACCOUNT
- [ ] Install Firebase Admin: `npm install firebase-admin`
- [ ] Initialize Firebase Admin in `/api/notifications/send/route.ts`
- [ ] Implement send notification endpoint
- [ ] Test sending notification
- [ ] Implement `/api/notifications/test` endpoint
- [ ] Test notification settings storage

---

### **Two-Factor Authentication**

- [ ] Install otplib: `npm install otplib qrcode`
- [ ] Add `twoFactorEnabled` and `twoFactorSecret` to User model
- [ ] Run `npx prisma db push`
- [ ] Implement POST `/api/security/two-factor` (enable 2FA, return QR)
- [ ] Implement DELETE `/api/security/two-factor` (disable 2FA)
- [ ] Implement POST `/api/security/two-factor/verify` (verify TOTP code)
- [ ] Update NextAuth sign-in callback to check 2FA
- [ ] Add 2FA verification page
- [ ] Test with Google Authenticator app
- [ ] Generate and store backup codes

---

### **Password Change**

- [ ] Implement POST `/api/auth/change-password`
- [ ] Verify current password with bcrypt
- [ ] Validate new password strength
- [ ] Hash new password with bcrypt
- [ ] Update user password in database
- [ ] Optionally invalidate all other sessions
- [ ] Test password change flow

---

### **Session Management**

- [ ] Install ua-parser-js: `npm install ua-parser-js`
- [ ] Create Abstract API account (free)
- [ ] Add ABSTRACT_API_KEY to .env
- [ ] Extend Session model with device/location fields
- [ ] Run `npx prisma db push`
- [ ] Implement GET `/api/security/sessions` (list all user sessions)
- [ ] Implement DELETE `/api/security/sessions/[id]` (terminate session)
- [ ] Update NextAuth callbacks to track device/location
- [ ] Test session listing
- [ ] Test session termination

---

### **News Aggregation**

- [ ] Install RSS parser: `npm install rss-parser`
- [ ] Create news aggregation function in `lib/newsData.ts`
- [ ] Add RSS feeds: CoinDesk, CoinTelegraph, Decrypt
- [ ] Create n8n workflow for scheduled RSS fetching (every hour)
- [ ] Store in Redis with key: `news:{articleId}`
- [ ] Create timeline sorted set: `news:timeline`
- [ ] Create API endpoint: GET `/api/news`
- [ ] Update `app/news/page.tsx` to fetch real data
- [ ] Test news fetching
- [ ] Optional: Add CryptoPanic API ($9/month)

---

### **Trading Tools Data**

- [ ] Update `lib/toolsData.ts` to fetch from CoinGecko
- [ ] Implement getTopMovers() with CoinGecko API
- [ ] Implement getFundingRates() with Binance API
- [ ] Create n8n workflow for periodic updates (every 5-15 min)
- [ ] Store in Redis with keys: `tools:movers`, `tools:funding`
- [ ] Set appropriate TTL (5-15 minutes)
- [ ] Update `app/tools/page.tsx` to fetch real data
- [ ] Test data fetching
- [ ] Monitor CoinGecko API usage (free tier: 10K/month)
- [ ] Plan upgrade to Analyst tier when needed ($129/month)

---

### **Airdrop Tracking**

- [ ] Install scraping tools: `npm install cheerio axios`
- [ ] Create scraping function in `lib/airdropsData.ts`
- [ ] Target websites: airdrops.io, airdropalert.com
- [ ] Create n8n workflow for scheduled scraping (every 6 hours)
- [ ] Parse HTML to extract airdrop data
- [ ] Optional: Use OpenAI GPT-4 to verify legitimacy
- [ ] Store in Redis with key: `airdrop:{id}`
- [ ] Create timeline sorted set: `airdrops:active`
- [ ] Update `app/airdrops/page.tsx` to fetch real data
- [ ] Test scraping
- [ ] Monitor and adjust selectors as websites change

---

### **Image Hosting**

- [ ] Create Cloudinary account
- [ ] Add CLOUDINARY_* variables to .env
- [ ] Install Cloudinary: `npm install cloudinary`
- [ ] Implement POST `/api/user/profile` (avatar upload)
- [ ] Configure image transformations (200x200, face detection)
- [ ] Store avatar URL in User model
- [ ] Test avatar upload
- [ ] Monitor Cloudinary usage (free tier: 25 credits/month)

---

### **Geolocation**

- [ ] Create Abstract API account
- [ ] Add ABSTRACT_API_KEY to .env
- [ ] Implement geolocation lookup in session tracking
- [ ] Parse IP address from request
- [ ] Fetch city, country from Abstract API
- [ ] Store in Session model
- [ ] Test geolocation detection
- [ ] Monitor usage (free tier: 20K/month)

---

## 🔐 Environment Variables Reference

Create a `.env.local` file with these variables:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Redis (Upstash)
REDIS_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# NextAuth (already configured)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-secret
DISCORD_SERVER_ID=your-server-id

# Stripe (Critical)
STRIPE_SECRET_KEY=sk_test_...  # Test mode, switch to sk_live_ for production
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CoinGecko (already configured, upgrade to Pro when needed)
COINGECKO_API_KEY=CG-...  # Optional for free tier, required for Pro

# Firebase Admin (for push notifications)
FIREBASE_ADMIN_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"..."}'

# Abstract API (geolocation)
ABSTRACT_API_KEY=your-abstract-key

# CryptoPanic (optional, $9/month)
CRYPTOPANIC_API_KEY=your-key

# Cloudinary (image hosting)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Apple Push Notifications (for iOS, later)
APNS_KEY_ID=your-key-id
APNS_TEAM_ID=your-team-id
APNS_AUTH_KEY=your-auth-key

# OpenAI (already used in n8n workflow)
OPENAI_API_KEY=sk-...
```

---

## 🗄️ Database Schema Changes

Add these models to `prisma/schema.prisma`:

```prisma
// Add to existing User model
model User {
  id                String    @id @default(cuid())
  // ... existing fields

  // 2FA fields
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?   // Store encrypted
  backupCodes       String[]  // Array of hashed backup codes

  // Subscription relation
  subscription      Subscription?
}

// New Subscription model
model Subscription {
  id                   String    @id @default(cuid())
  userId               String    @unique
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId     String    @unique
  stripeSubscriptionId String?   @unique
  stripePriceId        String?
  status               String    // active, canceled, past_due, trialing, incomplete
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean   @default(false)
  canceledAt           DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@index([userId])
  @@index([stripeCustomerId])
}

// Extend Session model (already exists from NextAuth)
model Session {
  id           String   @id @default(cuid())
  // ... existing NextAuth fields

  // Device tracking fields
  deviceType   String?  // desktop, mobile, tablet
  browser      String?  // Chrome, Firefox, Safari, etc.
  browserVersion String?
  os           String?  // Windows, macOS, iOS, Android
  osVersion    String?
  ipAddress    String?
  location     String?  // "San Francisco, CA, US"
  lastActivity DateTime @updatedAt
}
```

Run after changes:
```bash
npx prisma db push
npx prisma generate
```

---

## 📚 Additional Resources

### **General Documentation**
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://next-auth.js.org/
- n8n: https://docs.n8n.io/

### **API Documentation Quick Links**
- Stripe API Reference: https://docs.stripe.com/api
- CoinGecko API: https://www.coingecko.com/en/api/documentation
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Cloudinary API: https://cloudinary.com/documentation/image_upload_api_reference
- Abstract API: https://www.abstractapi.com/api

### **Testing Tools**
- Stripe CLI (for webhook testing): https://stripe.com/docs/stripe-cli
- Firebase Emulator Suite: https://firebase.google.com/docs/emulator-suite
- Postman (API testing): https://www.postman.com/

---

## 🎓 Learning Resources

### **Stripe Integration**
- Official Tutorial: https://stripe.com/docs/billing/subscriptions/build-subscriptions
- Next.js + Stripe: https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe

### **Push Notifications**
- Firebase FCM Guide: https://firebase.google.com/docs/cloud-messaging/js/client
- Web Push Protocol: https://web.dev/push-notifications-overview/

### **2FA Implementation**
- TOTP Explained: https://www.twilio.com/docs/glossary/totp
- otplib Documentation: https://yeojz.github.io/otplib/

---

## 💡 Pro Tips

### **Cost Optimization**
1. **Cache aggressively** - Use Redis to cache API responses
2. **Batch requests** - Fetch multiple coin prices in one CoinGecko call
3. **Use webhooks** - Let Stripe push updates instead of polling
4. **Optimize images** - Cloudinary auto-optimizes, reducing bandwidth
5. **Monitor usage** - Set up alerts in service dashboards before hitting limits

### **Security Best Practices**
1. **Encrypt 2FA secrets** - Use `crypto.createCipher` before storing
2. **Hash backup codes** - Never store plaintext backup codes
3. **Validate webhook signatures** - Always verify Stripe webhook signatures
4. **Rate limit APIs** - Prevent abuse of your endpoints
5. **Use environment variables** - Never commit secrets to git

### **Development Workflow**
1. **Test mode first** - Use Stripe test keys, don't process real payments
2. **Local webhooks** - Use Stripe CLI to forward webhooks to localhost
3. **Seed data** - Create npm scripts to seed test data
4. **Type safety** - Generate Prisma client after schema changes
5. **Error handling** - Log all API errors for debugging

---

## 📞 Support & Community

### **Getting Help**
- Stripe Support: https://support.stripe.com/
- Firebase Support: https://firebase.google.com/support
- Supabase Discord: https://discord.supabase.com/
- CoinGecko Email: hello@coingecko.com

### **Status Pages**
- Stripe: https://status.stripe.com/
- Firebase: https://status.firebase.google.com/
- Supabase: https://status.supabase.com/
- Cloudinary: https://status.cloudinary.com/

---

## ✅ Next Steps

1. **Review this document** and identify Phase 1 priorities
2. **Create accounts** for critical services (Supabase, Upstash, Stripe)
3. **Update .env.local** with all API keys
4. **Run database migrations** with Prisma
5. **Start with Stripe integration** (highest ROI)
6. **Complete Firebase Admin setup** (quick win)
7. **Follow weekly implementation plan** above

---

**Last Updated:** 2025-11-05
**Codebase:** Unity Oracle Aggregator
**Author:** Generated by Claude Code

---

## 🔍 Quick Search Index

Find information fast:
- **Payment:** Search "Stripe", "Paddle", or "Payment Processing"
- **Market Data:** Search "CoinGecko", "CoinCap", or "Cryptocurrency Market Data"
- **News:** Search "RSS", "CryptoPanic", or "News Aggregation"
- **Notifications:** Search "Firebase", "FCM", or "Push Notifications"
- **Security:** Search "2FA", "otplib", or "Two-Factor Authentication"
- **Database:** Search "Supabase", "Upstash", or "Database Hosting"
- **Images:** Search "Cloudinary" or "Image Hosting"
- **Sessions:** Search "Abstract API", "Geolocation", or "Session Management"

Use Ctrl+F (Cmd+F on Mac) to search this document.

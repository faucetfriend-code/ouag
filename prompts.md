# Implementation Prompts - Unity Oracle Aggregator

**Purpose:** Copy/paste these prompts to Claude Code to implement the free tier functionality
**Order:** Tasks are ordered by dependency and priority
**Total Time:** 30-40 hours across 6 weeks
**Cost:** $0/month for first 500-1000 users

---

## 📖 HOW TO USE THIS FILE

1. **Follow the order** - Tasks have dependencies, don't skip ahead
2. **Complete prerequisites** - Set up accounts before running prompts
3. **Copy entire prompt** - Including credential placeholders
4. **Fill in credentials** - Replace `[paste ...]` with your actual values
5. **Run one at a time** - Complete and test each task before moving to next
6. **Check acceptance criteria** - Verify everything works before proceeding

---

## 🎯 QUICK START CHECKLIST

### Before Task 1:
- [ ] Create Supabase account at https://supabase.com/dashboard
- [ ] Have DATABASE_URL ready to paste

### Before Task 2:
- [ ] Create Upstash account at https://console.upstash.com
- [ ] Have REDIS_URL and token ready to paste

### Before Task 3:
- [ ] Create Stripe account at https://dashboard.stripe.com/register
- [ ] Have test API keys ready to paste
- [ ] Complete Task 1 (PostgreSQL deployed)

### Before Task 4:
- [ ] Go to Firebase Console
- [ ] Download service account JSON
- [ ] Have JSON ready to paste as single-line string

---

## PHASE 1: CRITICAL INFRASTRUCTURE (Week 1-2)

---

# Task 1: Deploy PostgreSQL to Supabase

**Time:** 30 minutes
**Priority:** 🔴 CRITICAL
**Dependencies:** None
**Cost:** $0/month (500MB free tier)

## Prerequisites

1. Create Supabase account: https://supabase.com/dashboard
2. Create new project (choose region close to you)
3. Wait for project to provision (~2 minutes)
4. Go to Project Settings → Database
5. Copy the "Connection string" (URI format, not session pooler)
6. It should look like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## Prompt

```
Deploy PostgreSQL database to Supabase:

I have created a Supabase project. Here is my DATABASE_URL:
DATABASE_URL="[paste your Supabase connection string here]"

Please:
1. Update .env.local with the new DATABASE_URL (replace existing local DATABASE_URL)
2. Verify lib/prisma.ts is configured correctly for cloud connection (should work without changes)
3. Run `npx prisma db push` to create all tables in Supabase
4. Run `npx prisma generate` to update Prisma client
5. Test the connection by:
   - Starting the dev server
   - Attempting to log in
   - Verify user data is being saved to Supabase (check Supabase dashboard → Table Editor)
6. Provide me with verification steps to confirm everything works

Important:
- Keep a backup of the old DATABASE_URL (local) in case I need to switch back
- Ensure all Prisma models are created in Supabase
- Test that user authentication still works
```

## Acceptance Criteria

- [ ] Supabase project created
- [ ] DATABASE_URL updated in .env.local
- [ ] All Prisma tables created in Supabase (check Table Editor)
- [ ] Can log in and see user data in Supabase
- [ ] App works exactly as before, but with cloud database
- [ ] Local development still functional

## Troubleshooting

**Error: "Can't reach database server"**
- Check DATABASE_URL is correct (no extra spaces)
- Verify Supabase project is active (green status in dashboard)
- Check firewall/network isn't blocking Supabase

**Error: "Schema validation failed"**
- Run `npx prisma generate` again
- Restart TypeScript server in IDE

---

# Task 2: Deploy Redis to Vercel KV

**Time:** 30 minutes
**Priority:** 🔴 CRITICAL
**Dependencies:** None
**Cost:** $0/month (256MB, 3K commands/day free tier)

## Prerequisites

1. Link your project to Vercel (if not already linked):
   ```bash
   vercel link
   ```
   Follow prompts to connect to your Vercel project

2. Create Vercel KV database via Vercel Dashboard:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Click "Storage" tab
   - Click "Create Database"
   - Select "KV" (Upstash-powered Redis)
   - Name: "unity-oracle-redis" (or any name)
   - Region: Choose closest to your users
   - Click "Create"

3. Pull environment variables to local:
   ```bash
   vercel env pull .env.local
   ```
   This downloads KV_REST_API_URL and KV_REST_API_TOKEN automatically

4. Verify .env.local has these variables:
   - KV_REST_API_URL
   - KV_REST_API_TOKEN

## Prompt

```
Deploy Redis to Vercel KV (Upstash-powered):

I have created a Vercel KV database and pulled environment variables.
My .env.local now has (from `vercel env pull .env.local`):
KV_REST_API_URL="[automatically populated]"
KV_REST_API_TOKEN="[automatically populated]"

Please:
1. Install the Upstash Redis SDK: `npm install @upstash/redis`
2. Update lib/redis.ts to use Upstash REST API instead of node-redis:
   - Import from '@upstash/redis': `import { Redis } from '@upstash/redis'`
   - Create Redis instance with Vercel KV env vars:
     ```typescript
     const redis = new Redis({
       url: process.env.KV_REST_API_URL!,
       token: process.env.KV_REST_API_TOKEN!
     })
     ```
   - Keep all existing method signatures (getPost, storePost, etc.)
   - Ensure compatibility with existing code (return types, async/await)
3. Verify .env.local has:
   KV_REST_API_URL="..."
   KV_REST_API_TOKEN="..."
4. Test the connection by:
   - Starting dev server: `npm run dev`
   - Fetching analyst posts (should work if data exists)
   - If no data, test by storing and retrieving a test post
5. Update n8n workflow webhook endpoint (if needed) to write to Vercel KV
6. Provide verification steps

Important:
- Use @upstash/redis package (supports Edge runtime, serverless)
- Vercel KV uses KV_* prefix (not UPSTASH_* prefix)
- Keep existing method names and interfaces
- Ensure data from local Redis can be re-seeded if needed
- Test that analyst posts still display correctly on frontend
- Vercel KV is powered by Upstash but managed through Vercel

Note: Existing local Redis data will NOT transfer automatically. You may need to:
- Option A: Re-run `npm run redis:init` to seed initial analyst data (if seed script exists)
- Option B: Have n8n workflow generate new posts
- Option C: Manually re-ingest a few posts for testing
```

## Acceptance Criteria

- [ ] Vercel project linked (`vercel link` completed)
- [ ] Vercel KV database created in Vercel dashboard
- [ ] @upstash/redis installed
- [ ] Environment variables pulled (`vercel env pull .env.local`)
- [ ] KV_REST_API_URL and KV_REST_API_TOKEN in .env.local
- [ ] lib/redis.ts updated for Vercel KV REST API
- [ ] Can read/write to Vercel KV (test with a dummy post)
- [ ] Analyst posts display correctly on frontend
- [ ] n8n workflow can write to Vercel KV (if configured)

## Troubleshooting

**Error: "Invalid token"**
- Run `vercel env pull .env.local` again to refresh
- Check Vercel dashboard that KV database is active
- Ensure no extra quotes or spaces in .env.local

**Error: "vercel: command not found"**
- Install Vercel CLI: `npm install -g vercel`
- Or use npx: `npx vercel link`

**Error: "Method not found"**
- Vercel KV uses @upstash/redis package
- Check @upstash/redis docs: https://docs.upstash.com/redis
- Ensure method names match Upstash SDK (not node-redis)

**No data showing:**
- Expected if migrating from local Redis
- Re-seed data with `npm run redis:init` or wait for n8n workflow to run
- Check Vercel KV dashboard → Data Browser to see if keys exist

**Vercel KV not showing in dashboard:**
- Make sure you created it in the correct project
- Try refreshing the page
- Check Storage tab (not Databases tab)

---

# Task 3: Implement Stripe Subscription System

**Time:** 6-8 hours
**Priority:** 🔴 CRITICAL (enables revenue)
**Dependencies:** Task 1 (PostgreSQL/Supabase deployed)
**Cost:** $0/month (2.9% + $0.30 per transaction only)

## Prerequisites

1. Complete Task 1 (PostgreSQL must be deployed)
2. Create Stripe account: https://dashboard.stripe.com/register
3. Switch to **Test Mode** (toggle in top right)
4. Go to Developers → API Keys
5. Copy:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)
6. Don't create webhook yet (will do in prompt)

## Prompt

```
Implement Stripe subscription system with full payment integration:

My Stripe credentials (TEST MODE):
STRIPE_SECRET_KEY="[paste sk_test_... key here]"
STRIPE_PUBLISHABLE_KEY="[paste pk_test_... key here]"

Please:

### 1. Install Stripe SDK
npm install stripe

### 2. Add Subscription Model to Database

Add this to prisma/schema.prisma:

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
  @@index([stripeSubscriptionId])
}

Also add to User model:
model User {
  // ... existing fields
  subscription      Subscription?
}

Then run: npx prisma db push

### 3. Create lib/stripe.ts

Create Stripe client singleton with proper error handling.

### 4. Implement API Routes

**A) app/api/subscription/route.ts** - Replace TODO with:
- GET: Fetch user's current subscription from Stripe
  - Check database for stripeCustomerId
  - If exists, fetch subscription from Stripe API
  - Return subscription details (status, plan, current_period_end)
- POST: Handle subscription actions
  - Action: "subscribe" → Create customer + subscription
    - Create Stripe customer with user email
    - Create subscription with price ID
    - Store customerId and subscriptionId in database
  - Action: "cancel" → Cancel at period end
  - Action: "reactivate" → Un-cancel subscription
  - Return updated subscription

**B) app/api/billing/payment-methods/route.ts** - Replace TODO with:
- GET: List payment methods for customer
- POST: Handle actions
  - Action: "add" → Attach payment method to customer
  - Action: "remove" → Detach payment method
  - Action: "set-default" → Set default payment method

**C) app/api/billing/invoices/route.ts** - Replace TODO with:
- GET: Fetch invoice history from Stripe
  - List invoices for customer
  - Return invoice list with dates, amounts, status, PDF links

**D) app/api/webhooks/stripe/route.ts** - NEW FILE:
- Handle webhook events:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
- Verify webhook signature (CRITICAL for security)
- Update Subscription table based on events
- Return 200 status for successful processing

### 5. Update Environment Variables

Add to .env.local:
STRIPE_SECRET_KEY="[value]"
STRIPE_PUBLISHABLE_KEY="[value]"
STRIPE_WEBHOOK_SECRET="whsec_..." (will get this after webhook setup)

### 6. Webhook Setup Instructions

After implementation, provide me with:
- The webhook endpoint URL: /api/webhooks/stripe
- List of events to listen for in Stripe dashboard
- How to get STRIPE_WEBHOOK_SECRET

### 7. Test Plan

Provide step-by-step testing instructions using Stripe test cards:
- Test card: 4242 4242 4242 4242
- Test subscription creation
- Test subscription cancellation
- Test failed payment (card: 4000 0000 0000 0341)

Important:
- Use Stripe test mode throughout
- Validate webhook signatures (security critical)
- Handle all error cases (card declined, etc.)
- Store minimal data (no PII beyond what Stripe requires)
- Follow makeconnections.md lines 59-128 for detailed patterns

Reference the existing UI:
- app/settings/subscription/page.tsx - Subscription page UI
- components/settings/SubscriptionSettingsModal.tsx - Settings modal

The UI already exists and is complete. Just connect it to your API routes.
```

## Acceptance Criteria

- [ ] Stripe SDK installed
- [ ] Subscription model in database (check Supabase Table Editor)
- [ ] lib/stripe.ts created with singleton pattern
- [ ] Can create subscription via UI (test mode, use 4242... card)
- [ ] Subscription appears in Stripe dashboard
- [ ] Subscription status shows correctly in app
- [ ] Can cancel subscription (cancels at period end)
- [ ] Can reactivate subscription
- [ ] Webhooks configured and receiving events
- [ ] Invoice history displays
- [ ] Payment methods can be added/removed

## Troubleshooting

**Error: "No such customer"**
- Customer ID not saved correctly in database
- Check Subscription.stripeCustomerId is populated

**Webhook not receiving events:**
- Run Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Get webhook secret from CLI output
- Add to .env.local as STRIPE_WEBHOOK_SECRET

**Subscription not updating:**
- Check webhook handler is processing events
- Look for errors in webhook logs (Stripe dashboard → Developers → Webhooks)

---

# Task 4: Complete Firebase Admin SDK Setup

**Time:** 2-3 hours
**Priority:** 🔴 HIGH
**Dependencies:** None
**Cost:** $0/month (unlimited notifications)

## Prerequisites

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Project Settings (gear icon) → Service Accounts
4. Click "Generate new private key"
5. Confirm - downloads a JSON file
6. Open the JSON file in a text editor
7. Copy the ENTIRE contents as a single line (no newlines)
8. Important: Keep this file secure, never commit to git

## Prompt

```
Complete Firebase Admin SDK setup for server-side push notifications:

I have my Firebase service account JSON. Here it is as a single-line string:
FIREBASE_ADMIN_SERVICE_ACCOUNT='[paste entire JSON file content here as single-line string]'

Please:

### 1. Install Firebase Admin
npm install firebase-admin

### 2. Create lib/firebase-admin.ts

Create Firebase Admin singleton:
- Initialize Firebase Admin once (check if already initialized)
- Parse FIREBASE_ADMIN_SERVICE_ACCOUNT from env
- Initialize with credential.cert()
- Export a getMessaging() function that returns admin.messaging()
- Include error handling for missing/invalid credentials

### 3. Implement /api/notifications/send/route.ts

Complete the implementation:
- Authenticate user via NextAuth session
- Accept payload: { userId?, title, body, data?, link? }
- If userId provided: send to that user's device(s)
- If no userId: send to current user
- Fetch user's push tokens from database (User.pushTokens or separate PushToken table)
- Use Firebase Admin messaging().send() or messaging().sendMulticast()
- Notification format:
  - notification: { title, body }
  - data: { ...custom data }
  - webpush: { fcmOptions: { link } } for click action
- Handle errors:
  - Invalid tokens (remove from database)
  - Other errors (log and return error message)
- Return success/failure status

### 4. Implement /api/notifications/test/route.ts

Create test endpoint:
- Send test notification to current user
- Use hardcoded test message: "Test Notification"
- Body: "This is a test notification from Unity Oracle"
- Return success message

### 5. Update .env.local

Add:
FIREBASE_ADMIN_SERVICE_ACCOUNT='[JSON value]'

### 6. Test Push Notifications

Provide me with:
- How to get a push token (should already exist from client setup)
- How to test sending a notification
- Expected behavior when notification is received

Important:
- Client-side FCM is already setup (lib/push-notifications.ts)
- Service worker already registered (public/firebase-messaging-sw.js)
- Just need to complete server-side sending
- Test on desktop Chrome first (easiest to debug)

Current state:
- ✅ Client can request permissions
- ✅ Client can receive tokens
- ✅ Service worker registered
- ❌ Server cannot send notifications (this task fixes it)

Reference makeconnections.md lines 486-558 for implementation details.
```

## Acceptance Criteria

- [ ] firebase-admin installed
- [ ] lib/firebase-admin.ts created with singleton
- [ ] Firebase Admin initialized successfully
- [ ] /api/notifications/send implemented
- [ ] /api/notifications/test implemented
- [ ] Can send test notification via API
- [ ] Notification received on client (desktop Chrome)
- [ ] Notification shows title, body, and click action works
- [ ] Error handling for invalid tokens

## Testing Steps

1. Open app in Chrome
2. Allow notifications when prompted
3. Go to Settings → Notifications → Test Notification button
4. Click button
5. Should see notification appear (top-right on Windows, top-center on Mac)
6. Click notification → should navigate to specified link

## Troubleshooting

**Error: "Credential implementation provided to initializeApp() via the 'credential' property failed"**
- JSON is malformed or incomplete
- Ensure entire JSON is copied, including all braces
- Try parsing JSON manually first: `JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)`

**Notification not showing:**
- Check browser console for errors
- Verify push token is saved in database
- Test if permission is granted: `Notification.permission` should be "granted"
- Check service worker is active: Dev Tools → Application → Service Workers

**Error: "Requested entity was not found"**
- Push token is invalid or expired
- Remove invalid tokens from database
- Re-register for push notifications

---

## PHASE 2: CORE SECURITY FEATURES (Week 3-4)

---

# Task 5: Implement Two-Factor Authentication (2FA)

**Time:** 4-6 hours
**Priority:** 🔴 HIGH (security best practice)
**Dependencies:** Task 1 (PostgreSQL/Supabase deployed)
**Cost:** $0 (free npm library)

## Prerequisites

1. Task 1 must be complete (PostgreSQL deployed)
2. Download Google Authenticator app on phone (for testing)
   - iOS: https://apps.apple.com/us/app/google-authenticator/id388497605
   - Android: https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2

## Prompt

```
Implement TOTP-based Two-Factor Authentication using otplib:

Please:

### 1. Install Dependencies
npm install otplib qrcode

### 2. Extend User Model

Add to prisma/schema.prisma:
model User {
  // ... existing fields
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?   // Store encrypted (or base32 encoded)
  backupCodes       String[]  // Array of hashed backup codes
}

Run: npx prisma db push

### 3. Implement POST /api/security/two-factor/route.ts (Enable 2FA)

- Authenticate user via NextAuth session
- Generate TOTP secret: authenticator.generateSecret()
- Create otpauth URL: authenticator.keyuri(user.email, "Unity Oracle", secret)
- Generate QR code: QRCode.toDataURL(otpauthURL)
- Generate 10 backup codes (8 chars each, alphanumeric)
- Hash backup codes with bcrypt before storing
- Store secret and hashed backup codes in database (don't enable yet)
- Return: { qrCode: dataURL, secret: secret, backupCodes: plain codes }
- User must verify code before 2FA is enabled

### 4. Create POST /api/security/two-factor/verify/route.ts (Verify & Enable)

- Authenticate user
- Accept: { code: string } (6-digit code from authenticator app)
- Verify code: authenticator.verify({ token: code, secret: user.twoFactorSecret })
- If valid:
  - Set user.twoFactorEnabled = true
  - Update database
  - Return success
- If invalid:
  - Return error "Invalid code"

### 5. Implement DELETE /api/security/two-factor/route.ts (Disable 2FA)

- Authenticate user
- Require current password or TOTP code for verification
- Set user.twoFactorEnabled = false
- Clear user.twoFactorSecret and backupCodes
- Update database
- Return success

### 6. Update lib/auth.ts (NextAuth Sign-In)

Modify NextAuth configuration:
- In signIn callback, after successful authentication:
  - Check if user.twoFactorEnabled === true
  - If yes, do NOT sign them in yet
  - Instead, redirect to /auth/verify-2fa page with userId in query
  - Store pending auth state (temporary token or session flag)
- Create /auth/verify-2fa page:
  - Show "Enter your 2FA code" form
  - Accept 6-digit code
  - POST to /api/security/two-factor/verify
  - If valid, complete sign-in
  - If invalid, show error

### 7. Backup Code Verification

Add support for backup codes:
- If user enters 8-character code (not 6-digit):
  - Hash it and compare to stored backupCodes
  - If match, remove that code from array (one-time use)
  - Allow sign-in
- Update database to remove used backup code

### 8. Security Considerations

- NEVER store plain text secret or backup codes
- Use timing-safe comparison for codes
- Rate limit verification attempts (max 5 per minute)
- Log 2FA enable/disable events

### 9. Test Plan

Provide steps to:
1. Enable 2FA (scan QR with Google Authenticator)
2. Verify 6-digit code
3. Log out and log back in (should require 2FA code)
4. Test backup code (should work once)
5. Disable 2FA

Important:
- UI already exists in components/settings/SecuritySettingsModal.tsx
- QR code will be displayed in modal
- Follow TOTP RFC 6238 standard
- Time window: 30 seconds (default)
- Reference makeconnections.md lines 604-662

Note: This is a complex task. Break it into steps if needed:
Step 1: Generate QR code
Step 2: Verify code
Step 3: Integrate with NextAuth
```

## Acceptance Criteria

- [ ] otplib and qrcode installed
- [ ] User model has 2FA fields
- [ ] Can enable 2FA via settings
- [ ] QR code displays correctly
- [ ] Google Authenticator can scan QR
- [ ] 6-digit codes verify correctly
- [ ] Login requires 2FA code when enabled
- [ ] Backup codes generated (10 codes)
- [ ] Backup codes work (one-time use)
- [ ] Can disable 2FA
- [ ] 2FA state persists across sessions

## Testing Steps

1. Go to Settings → Security → Enable 2FA
2. Scan QR code with Google Authenticator app
3. Enter 6-digit code from app
4. Should show success + backup codes (save these!)
5. Log out
6. Log in again
7. Should prompt for 2FA code
8. Enter code from authenticator
9. Should successfully log in
10. Test backup code (log out, log in, use backup code)
11. Disable 2FA

## Troubleshooting

**QR code won't scan:**
- Ensure QR code is large enough
- Try manually entering the secret (base32 string)
- Check otpauthURL format: `otpauth://totp/Unity Oracle:user@example.com?secret=BASE32SECRET&issuer=Unity Oracle`

**Codes not verifying:**
- Check system time is synchronized (TOTP is time-based)
- Verify secret is stored correctly
- Test with: `authenticator.check(code, secret)` returns true/false
- Window: default is 30 seconds, allow ±1 window for clock drift

**Login stuck after enabling 2FA:**
- Implement /auth/verify-2fa page
- Ensure redirect logic works
- Test logout/login flow thoroughly

---

# Task 6: Implement Password Change API

**Time:** 1-2 hours
**Priority:** 🟡 MEDIUM
**Dependencies:** None (bcrypt already installed)
**Cost:** $0

## Prerequisites

- bcrypt is already installed (comes with NextAuth)
- No new accounts needed

## Prompt

```
Implement secure password change functionality:

Please implement POST /api/auth/change-password/route.ts:

### Requirements

1. Authenticate user via NextAuth session
2. Accept payload: { currentPassword: string, newPassword: string }
3. Fetch user from database with current password hash
4. Verify current password:
   - Use bcrypt.compare(currentPassword, user.hashedPassword)
   - If incorrect, return 401 "Current password is incorrect"
5. Validate new password strength:
   - Minimum 8 characters
   - At least one uppercase letter (A-Z)
   - At least one lowercase letter (a-z)
   - At least one number (0-9)
   - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
   - Return 400 with specific error if validation fails
6. Check new password is different from current:
   - Don't allow changing to same password
7. Hash new password:
   - Use bcrypt.hash(newPassword, 10) (10 rounds)
8. Update user.password in database
9. Optional: Ask user if they want to invalidate all other sessions
   - If yes, delete all sessions except current from database
10. Return success message

### Error Handling

- 401: Not authenticated
- 400: Invalid input (weak password, validation failed)
- 401: Current password incorrect
- 500: Database error

### Security Best Practices

- Use constant-time comparison for password check
- Rate limit (max 5 attempts per 15 minutes per user)
- Log password change events (timestamp, IP, user)
- Never return password in response
- Don't reveal if user exists (timing attacks)

### Test Cases

Provide tests for:
1. Successful password change
2. Wrong current password
3. Weak new password (too short)
4. Weak new password (missing uppercase)
5. Weak new password (missing number)
6. Same password (old = new)

Important:
- UI already exists in components/settings/SecuritySettingsModal.tsx
- Password change form is complete
- Just need to connect it to this API endpoint
- bcrypt is already available from NextAuth installation

Current password field in User model:
- Check your schema: might be `password`, `hashedPassword`, or `passwordHash`
- Find the correct field name first
```

## Acceptance Criteria

- [ ] Can change password via settings UI
- [ ] Current password verified correctly
- [ ] Strong password requirements enforced
- [ ] Password updated in database
- [ ] Can log in with new password
- [ ] Error handling for wrong current password
- [ ] Clear error messages for weak passwords
- [ ] Cannot change to same password

## Testing Steps

1. Go to Settings → Security → Change Password
2. Enter current password
3. Try weak new password (e.g., "test123") → Should show error
4. Try strong new password (e.g., "Test123!@#") → Should succeed
5. Log out
6. Log in with new password → Should work
7. Log in with old password → Should fail
8. Test wrong current password → Should show error

## Troubleshooting

**Error: "password field not found"**
- Check User model in prisma/schema.prisma
- Field might be named `hashedPassword` or `passwordHash`
- Update code to use correct field name

**Password always incorrect:**
- Check bcrypt.compare() is awaited
- Verify password is being hashed on user creation
- Ensure comparing against correct field

**Weak password accepted:**
- Review regex patterns for validation
- Test each requirement individually

---

# Task 7: Implement Session Management

**Time:** 3-4 hours
**Priority:** 🟡 MEDIUM
**Dependencies:** Task 1 (PostgreSQL deployed)
**Cost:** $0 (Abstract API free tier: 20K/month)

## Prerequisites

1. Task 1 complete (PostgreSQL deployed)
2. Create Abstract API account: https://app.abstractapi.com
3. Go to IP Geolocation API
4. Copy API key from dashboard (free tier: 20K requests/month)

## Prompt

```
Implement session management with device and location tracking:

My Abstract API key:
ABSTRACT_API_KEY="[paste your Abstract API key here]"

Please:

### 1. Install ua-parser-js
npm install ua-parser-js

### 2. Extend Session Model

Add to prisma/schema.prisma:
model Session {
  // ... existing NextAuth fields (id, sessionToken, userId, expires)
  deviceType       String?
  browser          String?
  browserVersion   String?
  os               String?
  osVersion        String?
  ipAddress        String?
  location         String?  // Format: "City, State/Province, Country"
  lastActivity     DateTime @updatedAt

  // Keep existing relations
}

Run: npx prisma db push

### 3. Update lib/auth.ts (NextAuth Callbacks)

Modify NextAuth configuration:

In `jwt` callback:
- Parse User-Agent with ua-parser-js
- Extract: device.type, browser.name, browser.version, os.name, os.version
- Get IP address from request headers:
  - Check x-forwarded-for, x-real-ip, or req.socket.remoteAddress
- Call Abstract API for geolocation:
  - GET https://ipgeolocation.abstractapi.com/v1/?api_key={key}&ip_address={ip}
  - Extract: city, region, country
  - Format as: "City, Region, Country" (e.g., "San Francisco, CA, United States")
- Store in token metadata

In `session` callback:
- When session is created/updated, update Session table:
  - Find session by sessionToken
  - Update device, browser, OS, IP, location fields
  - Update lastActivity timestamp

### 4. Implement GET /api/security/sessions/route.ts

- Authenticate user via NextAuth session
- Fetch all sessions for user from database:
  - Include all device/location fields
  - Order by lastActivity DESC (most recent first)
- Get current sessionToken from request cookies
- Mark current session in response:
  - Add `isCurrent: true` flag
- Return array of sessions

Response format:
{
  sessions: [
    {
      id: "...",
      deviceType: "desktop",
      browser: "Chrome 120",
      os: "Windows 10",
      ipAddress: "203.0.113.0",
      location: "San Francisco, CA, United States",
      lastActivity: "2025-01-05T10:30:00Z",
      isCurrent: true
    },
    ...
  ]
}

### 5. Implement DELETE /api/security/sessions/[sessionId]/route.ts

- Authenticate user
- Accept sessionId from URL params
- Verify session belongs to authenticated user (security!)
- Delete session from database
- Return success

### 6. Implement DELETE /api/security/sessions/route.ts (Terminate All Others)

- Accept query param: ?all=true
- Authenticate user
- Get current sessionToken from cookies
- Delete all user's sessions EXCEPT current one:
  - WHERE userId = user.id AND sessionToken != currentToken
- Return { deleted: count }

### 7. Error Handling

- Handle Abstract API errors gracefully (fallback to "Unknown Location")
- Handle missing User-Agent (default to "Unknown Browser")
- Handle invalid session IDs
- Prevent users from terminating other users' sessions

### 8. Add to .env.local

ABSTRACT_API_KEY="[value]"

Important:
- UI already exists in components/settings/SecuritySettingsModal.tsx
- Session list displays with device/location info
- Abstract API free tier: 20K requests/month (plenty for this use)
- Cache location data to reduce API calls (optional)
- Reference makeconnections.md lines 798-883

Testing:
- Open app in Chrome → should see "Chrome" session
- Open in Firefox → should see "Firefox" session
- Terminate one session → should disappear from list
- Terminate all others → only current should remain
```

## Acceptance Criteria

- [ ] ua-parser-js installed
- [ ] Session model extended with device/location fields
- [ ] Device info captured on login (browser, OS)
- [ ] Location info captured (city, country)
- [ ] Can list all active sessions
- [ ] Current session marked clearly
- [ ] Can terminate individual session
- [ ] Can terminate all other sessions
- [ ] Session list updates correctly
- [ ] Last activity timestamp updates

## Testing Steps

1. Log in from Chrome (desktop)
2. Go to Settings → Security → Active Sessions
3. Should see 1 session: "Chrome on Windows" (or your OS)
4. Open app in Firefox (or another browser)
5. Log in
6. Check sessions again → should see 2 sessions
7. Terminate Firefox session from Chrome
8. Firefox should be logged out
9. Test "Terminate All Other Sessions" button
10. Only current session should remain

## Troubleshooting

**Location shows "Unknown Location":**
- Abstract API key might be invalid
- Check API quota (free tier: 20K/month)
- API might be rate limited (1 request/second)
- Fallback to "Unknown" is expected behavior

**Device info all "Unknown":**
- User-Agent header might be missing
- Check request.headers.get('user-agent')
- Some browsers/tools hide User-Agent

**Session not terminating:**
- Check sessionId is correct
- Verify session belongs to user (security check)
- NextAuth might cache sessions (clear browser cookies)

---

## PHASE 3: CONTENT & DATA (Week 5-6)

---

# Task 8: Implement RSS News Feed

**Time:** 3-4 hours
**Priority:** 🟢 MEDIUM
**Dependencies:** Task 2 (Redis/Upstash deployed)
**Cost:** $0 (RSS feeds are free)

## Prerequisites

1. Task 2 complete (Redis deployed to Upstash)
2. No accounts needed (RSS feeds are open)

## Prompt

```
Implement real crypto news aggregation using RSS feeds:

Please:

### 1. Install RSS Parser
npm install rss-parser

### 2. Update lib/newsData.ts

Replace mock data functions with real RSS parsing:

RSS Feed Sources:
- CoinDesk: https://www.coindesk.com/arc/outboundfeeds/rss/
- CoinTelegraph: https://cointelegraph.com/rss
- Decrypt: https://decrypt.co/feed
- The Block: https://www.theblock.co/rss.xml

Functions to implement:
- parseRSSFeeds(): Fetch all 4 RSS feeds in parallel
- mergeFeeds(): Combine all feed items
- deduplicateByURL(): Remove duplicate articles (same URL)
- storeInRedis(): Store articles with keys:
  - `news:{articleId}` → Full article data (title, description, link, pubDate, source)
  - `news:timeline` → Sorted set (score: pubDate timestamp)
- getNews(page, limit): Fetch from Redis, paginated

Article format:
{
  id: string (hash of URL),
  title: string,
  description: string (summary/excerpt),
  link: string (original article URL),
  pubDate: Date,
  source: string ("CoinDesk", "CoinTelegraph", etc.),
  imageUrl?: string (from RSS if available)
}

### 3. Create /api/news/route.ts (NEW FILE)

- GET: Fetch news from Redis
  - Accept query params: page (default 1), limit (default 20)
  - Fetch from `news:timeline` sorted set (most recent first)
  - Get article details for each ID from `news:{id}`
  - Return paginated results
- POST: Store news (called by n8n workflow)
  - Accept array of articles
  - Store each in Redis
  - Add to timeline sorted set

### 4. Create n8n Workflow for RSS Fetching

Provide n8n workflow JSON:
- Schedule: Cron (every hour: "0 * * * *")
- HTTP Request nodes to fetch each RSS feed
- Function node to parse RSS XML
- Function node to deduplicate
- HTTP Request to POST to /api/news (or direct Redis write)
- Error handling for failed feeds

### 5. Update app/news/page.tsx

Replace mock data fetch:
- Change from using lib/newsData.ts mock functions
- Fetch from /api/news?page=1&limit=20
- Implement pagination (if not already present)
- Display articles sorted by date

### 6. Test News Aggregation

Provide testing steps:
1. Run n8n workflow manually to populate initial data
2. Check Redis for `news:timeline` key
3. Check news page shows real articles
4. Test pagination
5. Verify articles link to original sources

Important:
- UI already exists in app/news/page.tsx
- Categories/filtering already implemented in UI
- Just replace data source from mock to Redis
- RSS feeds are updated frequently (CoinDesk posts multiple times per hour)
- Store articles for 7 days, then expire (set TTL on Redis keys)

Optional enhancements:
- Add sentiment analysis (positive/negative/neutral) using keywords
- Extract mentioned cryptocurrencies from title/description
- Add category classification (DeFi, NFTs, Regulation, etc.)
```

## Acceptance Criteria

- [ ] rss-parser installed
- [ ] Can parse RSS feeds from all 4 sources
- [ ] Articles merged and deduplicated
- [ ] Articles stored in Redis
- [ ] /api/news endpoint works
- [ ] News page shows real articles
- [ ] Articles sorted by date (newest first)
- [ ] Pagination works
- [ ] n8n workflow runs hourly (or can be triggered manually)
- [ ] No duplicate articles shown

## Testing Steps

1. Run n8n workflow manually (or call parseRSSFeeds() directly)
2. Check Redis:
   - Keys should exist: `news:timeline`, `news:{id}`
   - Run: `redis-cli ZRANGE news:timeline 0 10` (should show article IDs)
3. Visit /news page
4. Should see real articles from CoinDesk, CoinTelegraph, etc.
5. Click article → should open original source
6. Check timestamp → should be recent (within last 24 hours)
7. Test pagination → page 2 should show older articles

## Troubleshooting

**No articles showing:**
- Check if RSS feeds are being fetched (test URLs in browser)
- Verify Redis connection (Task 2 complete?)
- Check n8n workflow for errors
- Manually run parseRSSFeeds() to test

**Duplicate articles:**
- Deduplication might not be working
- Check URL normalization (strip query params, trailing slashes)
- Use URL hash as article ID

**Articles not updating:**
- n8n workflow might not be running
- Check cron schedule: "0 * * * *" (every hour at :00)
- Test workflow manually first

---

# Task 9: Implement Trading Tools Real Data

**Time:** 4-5 hours
**Priority:** 🟢 MEDIUM
**Dependencies:** Task 2 (Redis/Upstash deployed)
**Cost:** $0 (CoinGecko free tier: 10K calls/month)

## Prerequisites

1. Task 2 complete (Redis deployed)
2. CoinGecko API key (optional for free tier)
   - Free tier: 10K calls/month, 30 calls/minute
   - If you have Pro: https://www.coingecko.com/en/developers/dashboard

## Prompt

```
Implement real data for Trading Tools using CoinGecko and Binance APIs:

My CoinGecko API key (optional, leave empty for free tier):
COINGECKO_API_KEY="[paste key if you have Pro, otherwise leave empty for free tier]"

Please:

### 1. Update lib/toolsData.ts

Replace mock data functions with real API calls:

**A) Top Gainers/Losers (CoinGecko)**
- Endpoint: GET https://api.coingecko.com/api/v3/coins/markets
- Params:
  - vs_currency=usd
  - order=percent_change_24h_desc (for gainers)
  - order=percent_change_24h_asc (for losers)
  - per_page=10
  - page=1
  - sparkline=false
- Parse response to extract: id, symbol, name, current_price, price_change_percentage_24h, image

**B) Top Volume (CoinGecko)**
- Same endpoint, different order:
  - order=volume_desc
- Extract: volume, market_cap in addition to above

**C) Funding Rates (Binance Futures API - FREE, no auth)**
- Endpoint: GET https://fapi.binance.com/fapi/v1/fundingRate
- Returns array: { symbol, fundingRate, fundingTime }
- Filter for major pairs: BTCUSDT, ETHUSDT, etc.
- Sort by absolute funding rate (highest positive or negative)
- Note: Funding rate is a decimal (e.g., 0.0001 = 0.01%)

### 2. Implement Redis Caching

Cache results with TTL:
- Store in Redis with keys:
  - `tools:movers:gainers` (TTL: 15 minutes)
  - `tools:movers:losers` (TTL: 15 minutes)
  - `tools:volume` (TTL: 15 minutes)
  - `tools:funding` (TTL: 15 minutes)
- Check cache first, if miss → fetch from API → cache result

### 3. Create API Routes (NEW FILES)

**A) app/api/tools/movers/route.ts**
- GET: Fetch top gainers and losers
- Return: { gainers: [...], losers: [...] }
- Try Redis first, fallback to CoinGecko if cache miss

**B) app/api/tools/funding/route.ts**
- GET: Fetch funding rates from Binance
- Return: [ { symbol, fundingRate, fundingTime }, ... ]
- Try Redis first, fallback to Binance if cache miss

### 4. Create n8n Workflow for Periodic Updates

Provide n8n workflow JSON:
- Schedule: Cron (every 15 minutes: "*/15 * * * *")
- HTTP Request nodes:
  - Fetch gainers from CoinGecko
  - Fetch losers from CoinGecko
  - Fetch volume from CoinGecko
  - Fetch funding from Binance
- Function nodes to parse responses
- HTTP Request to update Redis (or direct Redis write)
- Error handling

### 5. Update Tool Pages

Update these pages to fetch real data:
- app/tools/gainers-losers/page.tsx → Fetch from /api/tools/movers
- app/tools/top-volume/page.tsx → Fetch from /api/tools/movers (volume field)
- app/tools/funding-rates/page.tsx → Fetch from /api/tools/funding

Replace lib/toolsData.ts imports with API fetches.

### 6. Rate Limiting & Monitoring

- Add API call counter to track CoinGecko usage (free tier: 10K/month)
- Log API calls to monitor quota
- If approaching limit, increase cache TTL or reduce update frequency

### 7. Test Plan

Provide testing steps:
1. Fetch top gainers → should show real coins with positive % changes
2. Fetch top losers → should show coins with negative % changes
3. Fetch funding rates → should show real rates from Binance
4. Verify cache works (second fetch should be instant)
5. Check Redis keys exist and have TTL

Important:
- CoinGecko free tier: 10K calls/month, 30/min rate limit
- Binance Futures API is FREE and unlimited (no auth required for public data)
- With 15-min caching + n8n updates, usage is ~2,880 calls/month (well under 10K)
- UI already exists, just connect to real data
- Reference makeconnections.md lines 189-316

Optional enhancements:
- Add 7-day price charts (CoinGecko market_chart endpoint)
- Add liquidation data (requires third-party service or exchange API)
- Add open interest data (Binance: /fapi/v1/openInterest)
```

## Acceptance Criteria

- [ ] CoinGecko API integrated
- [ ] Binance API integrated
- [ ] Top gainers/losers show real data
- [ ] Top volume shows real data
- [ ] Funding rates show real data
- [ ] Data cached in Redis (15 min TTL)
- [ ] Tools pages display real data
- [ ] n8n workflow runs every 15 minutes
- [ ] API usage monitored (staying under 10K/month)
- [ ] Cache reduces API calls

## Testing Steps

1. Visit /tools/gainers-losers
2. Should see real coins (e.g., BTC, ETH, etc.)
3. Verify percentages are realistic (not mock data)
4. Check if coin is actually up/down today (verify on CoinGecko.com)
5. Visit /tools/funding-rates
6. Should see real rates from Binance
7. Verify symbols match Binance (e.g., BTCUSDT)
8. Check Redis keys in Upstash dashboard
9. Run workflow twice quickly → second should use cache (faster)

## Troubleshooting

**Error: "API rate limit exceeded":**
- CoinGecko free tier: 30 calls/minute
- Add delay between calls or use cache more aggressively
- Consider upgrading to Pro tier ($129/month)

**No data showing:**
- Check API responses (might be empty or error)
- Verify CoinGecko API is working (test in browser or Postman)
- Check Binance API endpoint (should work without auth)

**Funding rates not matching Binance:**
- Binance API returns decimal format (0.0001 = 0.01%)
- Convert to percentage: rate * 100
- Check symbol format: BTCUSDT (not BTC-USD)

---

# Task 10: Implement Airdrop Web Scraping

**Time:** 4-6 hours
**Priority:** 🔵 LOW
**Dependencies:** Task 2 (Redis deployed)
**Cost:** $0 (web scraping is free)

## Prerequisites

1. Task 2 complete (Redis deployed)
2. OpenAI API key (optional, for scam detection)
   - If you have it from n8n workflow: reuse it
   - Otherwise: https://platform.openai.com/api-keys

## Prompt

```
Implement airdrop tracking via web scraping:

My OpenAI API key (optional, for scam detection):
OPENAI_API_KEY="[paste key here, or leave empty to skip scam detection]"

Please:

### 1. Install Scraping Dependencies
npm install cheerio axios

### 2. Update lib/airdropsData.ts

Replace mock data with web scraping:

**Target Website:** airdrops.io
- URL: https://airdrops.io
- Scrape airdrop cards from homepage
- Cheerio selectors (these may change, adapt as needed):
  - Airdrop container: '.airdrop-card' or similar
  - Title: '.title' or 'h3'
  - Value: '.value' or '.reward'
  - End date: '.end-date' or '.expires'
  - Requirements: '.requirements' or '.steps'
  - Link: 'a.href'

Functions to implement:
- scrapeAirdrops(): Fetch HTML and parse with Cheerio
- parseAirdropCard(element): Extract data from each card
- validateAirdrop(data): Check if data is complete
- Optional: detectScam(airdrop): Use OpenAI to check legitimacy
- storeInRedis(): Store with keys:
  - `airdrop:{id}` → Full airdrop data
  - `airdrops:active` → Sorted set (score: end date timestamp)

Airdrop format:
{
  id: string (hash of URL or title),
  title: string,
  description: string,
  value: string ("$100 - $500" or "TBD"),
  endDate: Date | null,
  requirements: string[],
  link: string,
  source: "airdrops.io",
  verified: boolean (from scam detection),
  scrapedAt: Date
}

### 3. Optional: AI Scam Detection

If OpenAI key provided:
- Send airdrop title + description to GPT-4
- Prompt: "Is this crypto airdrop legitimate or a potential scam? Return JSON: { legitimate: boolean, confidence: number, reason: string }"
- Store verified: true/false based on response
- Skip if confidence < 0.7

### 4. Create /api/airdrops/route.ts (NEW FILE)

- GET: Fetch airdrops from Redis
  - Accept query params: page, limit, status (active/expired/all)
  - Fetch from `airdrops:active` sorted set (by end date)
  - Filter by status if provided
  - Return paginated results
- POST: Store airdrops (called by n8n workflow)
  - Accept array of airdrops
  - Store in Redis

### 5. Create n8n Workflow for Scraping

Provide n8n workflow JSON:
- Schedule: Cron (every 6 hours: "0 */6 * * *")
- HTTP Request to fetch airdrops.io HTML
- Function node with Cheerio to parse HTML
- Optional: Function node with OpenAI API call (scam detection)
- HTTP Request to POST to /api/airdrops
- Error handling:
  - If scraping fails (website structure changed), log error
  - Send notification to admin

### 6. Update app/airdrops/page.tsx

Replace mock data:
- Fetch from /api/airdrops?status=active
- Display airdrops sorted by end date (soonest first)
- Show value, requirements, end date
- Link to original airdrop page

### 7. Error Handling & Maintenance

- Web scraping is fragile (websites change structure)
- Provide guidance on updating selectors when site changes:
  - How to inspect airdrops.io HTML
  - How to find new selectors
  - How to test scraping locally
- Log scraping errors with details (selector not found, etc.)
- Fallback: If scraping fails, show cached data

### 8. Test Plan

Provide testing steps:
1. Run scraping function manually
2. Check Redis for airdrop keys
3. Check airdrops page shows real data
4. Verify end dates are realistic
5. Test "Apply" link opens original airdrop page
6. Optional: Test scam detection (known legitimate vs scam)

Important:
- UI already exists in app/airdrops/page.tsx
- Filtering/categories already implemented
- Web scraping may break when website updates (provide maintenance guide)
- Store airdrops for 30 days, then expire (set TTL)
- Reference makeconnections.md lines 415-481

Alternative sources (if airdrops.io changes):
- airdropalert.com
- coinmarketcap.com/airdrop
- Manual API (if available)
```

## Acceptance Criteria

- [ ] cheerio and axios installed
- [ ] Can scrape airdrops.io successfully
- [ ] Airdrop data parsed correctly (title, value, end date, requirements)
- [ ] Airdrops stored in Redis
- [ ] /api/airdrops endpoint works
- [ ] Airdrops page shows real data
- [ ] Airdrops sorted by end date (soonest first)
- [ ] n8n workflow runs every 6 hours
- [ ] Error handling for failed scraping
- [ ] Optional: Scam detection works

## Testing Steps

1. Run scraping function manually:
   ```javascript
   node -e "require('./lib/airdropsData').scrapeAirdrops().then(console.log)"
   ```
2. Should output array of airdrop objects
3. Check Redis: `ZRANGE airdrops:active 0 10` should show IDs
4. Visit /airdrops page
5. Should see real airdrops from airdrops.io
6. Verify end dates are realistic (not in past)
7. Click "Learn More" → should open airdrop page
8. Test n8n workflow manually

## Troubleshooting

**Scraping returns empty array:**
- Website structure may have changed
- Inspect airdrops.io HTML manually (browser Dev Tools)
- Update Cheerio selectors in code
- Check for anti-scraping measures (rate limiting, CAPTCHA)

**Selectors not matching:**
- airdrops.io uses dynamic class names (e.g., `class_abc123`)
- Use more stable selectors: data attributes, semantic HTML
- Example: `[data-airdrop-card]` instead of `.airdrop-card`

**Scam detection not working:**
- OpenAI API key might be invalid or quota exceeded
- Check OpenAI API usage dashboard
- Scam detection is optional, can skip if needed

**Legal/Ethical concerns:**
- Check airdrops.io robots.txt: https://airdrops.io/robots.txt
- Respect rate limits (1 request every 6 hours is very conservative)
- Don't scrape excessively or hammer the server
- Consider reaching out to airdrops.io for partnership/API access

---

# Task 11: Implement Image Uploads (Cloudinary)

**Time:** 2-3 hours
**Priority:** 🔵 LOW
**Dependencies:** None
**Cost:** $0 (Cloudinary free tier: 25 credits/month)

## Prerequisites

1. Create Cloudinary account: https://cloudinary.com/users/register_free
2. Go to Dashboard → Settings → API Keys
3. Copy:
   - Cloud Name
   - API Key
   - API Secret

## Prompt

```
Implement avatar image uploads using Cloudinary:

My Cloudinary credentials:
CLOUDINARY_CLOUD_NAME="[paste from dashboard]"
CLOUDINARY_API_KEY="[paste from dashboard]"
CLOUDINARY_API_SECRET="[paste from dashboard]"

Please:

### 1. Install Cloudinary SDK
npm install cloudinary

### 2. Add avatarUrl to User Model (if not exists)

Check prisma/schema.prisma User model:
- If avatarUrl field doesn't exist, add:
  model User {
    // ... existing fields
    avatarUrl  String?
  }
- Run: npx prisma db push

### 3. Create lib/cloudinary.ts

Configure Cloudinary:
- Import { v2 as cloudinary } from 'cloudinary'
- Configure with credentials from env
- Export configured cloudinary instance
- Export helper functions:
  - uploadAvatar(imageBuffer): Upload with transformations
  - deleteAvatar(publicId): Delete old avatar

### 4. Implement POST /api/user/profile/route.ts

Avatar upload endpoint:
- Authenticate user
- Accept multipart/form-data with file upload
- Validate:
  - File type: image/jpeg, image/png, image/gif only
  - File size: max 5MB
  - Required field: file
- Read file buffer
- Upload to Cloudinary with options:
  - folder: 'avatars'
  - public_id: user.id (overwrite existing)
  - transformation:
    - width: 200
    - height: 200
    - crop: 'fill'
    - gravity: 'face' (auto-detect face for smart cropping)
    - quality: 'auto'
    - format: 'jpg'
- If user has existing avatar, delete old one (optional, Cloudinary overwrites)
- Store secure_url in user.avatarUrl
- Update database
- Return: { avatarUrl: string }

### 5. Update Profile Page (app/profile/page.tsx)

Add avatar upload functionality:
- Add file input (hidden, triggered by "Change Avatar" button)
- On file select:
  - Show preview
  - Upload to /api/user/profile
  - Update displayed avatar
- Show loading spinner during upload
- Handle errors (file too large, invalid type, upload failed)

### 6. Error Handling

- 400: Invalid file type or size
- 413: File too large
- 500: Cloudinary upload failed
- Return specific error messages

### 7. Add to .env.local

CLOUDINARY_CLOUD_NAME="[value]"
CLOUDINARY_API_KEY="[value]"
CLOUDINARY_API_SECRET="[value]"

### 8. Test Plan

Provide testing steps:
1. Upload JPG avatar (< 5MB) → should succeed
2. Upload PNG avatar → should succeed
3. Upload 10MB image → should fail (too large)
4. Upload PDF file → should fail (invalid type)
5. Verify image is optimized (200x200, face cropped)
6. Check Cloudinary dashboard for uploaded image

Important:
- Cloudinary free tier: 25 credits/month
  - 1 credit ≈ 1,000 transformations or 1GB storage or 1GB bandwidth
  - 25 credits is generous for profile avatars
- Images auto-optimized for web (reduced size, WebP format)
- Face detection works for most photos
- Reference makeconnections.md lines 700-795

Optional enhancements:
- Add image cropping UI (react-image-crop)
- Support drag-and-drop upload
- Show upload progress bar
- Allow image rotation before upload
```

## Acceptance Criteria

- [ ] Cloudinary account created
- [ ] cloudinary SDK installed
- [ ] User model has avatarUrl field
- [ ] lib/cloudinary.ts created with config
- [ ] Avatar upload works (JPG, PNG)
- [ ] Images optimized (200x200)
- [ ] Face detection crops correctly
- [ ] Avatar URL stored in database
- [ ] Profile page displays uploaded avatar
- [ ] File size validation works (max 5MB)
- [ ] File type validation works (image only)

## Testing Steps

1. Go to profile page
2. Click "Change Avatar" or avatar placeholder
3. Select image file (< 5MB, JPG or PNG)
4. Should see upload progress
5. Avatar should update to new image
6. Check image quality (should be clear, not pixelated)
7. Check image is 200x200 (inspect in Dev Tools)
8. Go to Cloudinary dashboard → Media Library
9. Should see uploaded avatar in "avatars" folder
10. Try uploading different image → should replace previous

## Troubleshooting

**Upload fails silently:**
- Check Cloudinary credentials are correct
- Verify cloud name doesn't have typos
- Check API key has upload permissions

**Image not cropping correctly:**
- gravity: 'face' requires face in photo
- Fallback to gravity: 'center' if no face detected
- Try different source image with clear face

**File upload fails:**
- Check file input accepts: accept="image/*"
- Verify multipart/form-data encoding
- Check file buffer is read correctly

**Cloudinary quota exceeded:**
- Free tier: 25 credits/month
- Check usage in dashboard
- Optimize: reduce uploads, increase cache
- Upgrade if needed

---

## 🎉 COMPLETION

Congratulations! You've implemented all free tier functionality for Unity Oracle Aggregator.

### What You've Built

✅ **Phase 1 (Week 1-2):**
- PostgreSQL deployed to Supabase
- Redis deployed to Upstash
- Stripe subscription system
- Firebase Admin push notifications

✅ **Phase 2 (Week 3-4):**
- Two-factor authentication (2FA)
- Password change API
- Session management with device tracking

✅ **Phase 3 (Week 5-6):**
- RSS news aggregation
- Real trading tools data
- Airdrop web scraping
- Avatar image uploads

### Next Steps

1. **Test Everything End-to-End**
   - Create test user account
   - Try all features
   - Check for bugs

2. **Deploy to Production**
   - Switch Stripe to live mode
   - Update environment variables for production
   - Deploy to Vercel or your hosting platform

3. **Monitor Usage**
   - Watch Supabase database size (500MB free)
   - Monitor Upstash Redis commands (10K/day free)
   - Track CoinGecko API calls (10K/month free)

4. **Plan for Scale**
   - When to upgrade (see TDB.md Cost Migration Path)
   - Prepare for $40-70/month growth phase
   - Consider revenue vs. costs

### Cost Summary

**Current (Month 1-3): $0/month**
- Supports 500-1000 users
- 10K price updates/month
- Full feature set

**Future (Month 4-6): $40-70/month**
- Supports 1000-5000 users
- Better database performance
- Enhanced APIs

**Scale (Month 7+): $200-250/month**
- Supports 5K-20K users
- Historical data
- Premium features

---

## 📚 Additional Resources

- **TDB.md** - Updated roadmap with all tasks
- **makeconnections.md** - Detailed API documentation
- **CLAUDE.md** - Architecture and patterns
- **prisma/schema.prisma** - Database schema

---

## 🐛 Getting Help

If you encounter issues:

1. Check **Troubleshooting** section in each task
2. Review **Acceptance Criteria** - did you miss a step?
3. Check service status pages (links in TDB.md)
4. Ask Claude for specific debugging help

---

*End of prompts.md*
*Last Updated: 2025-11-05*
*Total Implementation Time: 30-40 hours*
*Total Cost: $0/month for launch*

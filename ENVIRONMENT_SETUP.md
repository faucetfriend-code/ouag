# Environment Setup Guide

This guide will help you configure all the required environment variables for the Unity Oracle Aggregator.

## Quick Start Checklist

- [ ] PostgreSQL database configured
- [ ] Redis database configured
- [ ] Discord OAuth application created
- [ ] NextAuth secret generated
- [ ] CoinGecko API key obtained (optional)
- [ ] Firebase project configured (optional - for mobile push)
- [ ] Web Push VAPID keys generated (optional - for web push)
- [ ] OpenAI API key obtained (optional - for n8n workflow)

## Step-by-Step Setup

### 1. Database Setup (REQUIRED)

#### PostgreSQL Setup

**Option A: Local Installation**
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb unity_oracle

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://postgres@localhost:5432/unity_oracle"
```

**Option B: Docker**
```bash
# Run PostgreSQL in Docker
docker run --name unity-postgres \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=unity_oracle \
  -p 5432:5432 \
  -d postgres:15

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/unity_oracle"
```

**Option C: Cloud Services**
- [Railway](https://railway.app/) - Free tier with PostgreSQL
- [Supabase](https://supabase.com/) - Free tier with PostgreSQL
- [Neon](https://neon.tech/) - Serverless PostgreSQL

#### Redis Setup

**Option A: Local Installation**
```bash
# Install Redis (macOS with Homebrew)
brew install redis
brew services start redis

# Your REDIS_URL will be:
REDIS_URL="redis://localhost:6379"
```

**Option B: Docker**
```bash
# Run Redis in Docker
docker run --name unity-redis \
  -p 6379:6379 \
  -d redis:7

# Your REDIS_URL will be:
REDIS_URL="redis://localhost:6379"
```

**Option C: Cloud Services**
- [Upstash](https://upstash.com/) - Serverless Redis with free tier
- [Redis Cloud](https://redis.com/try-free/) - Free tier available

### 2. Initialize Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npm run db:push

# Optional: Seed Redis with analyst data
npm run redis:init
```

### 3. Discord OAuth Setup (REQUIRED)

1. **Go to Discord Developer Portal**: https://discord.com/developers/applications

2. **Create New Application**
   - Click "New Application"
   - Name it "Unity Oracle Aggregator"
   - Click "Create"

3. **Configure OAuth2**
   - Go to OAuth2 → General
   - Copy **Client ID** → Add to `.env.local` as `DISCORD_CLIENT_ID`
   - Copy **Client Secret** → Add to `.env.local` as `DISCORD_CLIENT_SECRET`

4. **Add Redirect URLs**
   - Under "Redirects", add:
     - Development: `http://localhost:3000/api/auth/callback/discord`
     - Production: `https://yourdomain.com/api/auth/callback/discord`

5. **Get Discord Server ID**
   - In Discord app, enable Developer Mode (Settings → Advanced → Developer Mode)
   - Right-click your server name → Copy Server ID
   - Add to `.env.local` as `DISCORD_SERVER_ID`

### 4. NextAuth Secret Generation (REQUIRED)

```bash
# Generate a secure random secret
openssl rand -base64 32

# Copy the output to .env.local as NEXTAUTH_SECRET
```

### 5. CoinGecko API (OPTIONAL - Recommended for Portfolio)

**Free Tier (No API Key Required)**
- 10-30 calls/minute
- Works without API key
- Just leave `COINGECKO_API_KEY` empty

**Paid Tier (Better Rate Limits)**
1. Go to: https://www.coingecko.com/en/api/pricing
2. Sign up for a plan
3. Copy API key to `.env.local` as `COINGECKO_API_KEY`

### 6. Firebase Setup (OPTIONAL - For Mobile Push Notifications)

**Only needed if you want Android/iOS push notifications**

1. **Create Firebase Project**: https://console.firebase.google.com/

2. **Enable Cloud Messaging**
   - Go to Project Settings → Cloud Messaging
   - Enable Cloud Messaging API

3. **Generate Service Account**
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

4. **Extract Values from JSON**
   ```json
   {
     "project_id": "your-project-id",  // → FIREBASE_PROJECT_ID
     "client_email": "firebase-adminsdk-xxxxx@...",  // → FIREBASE_CLIENT_EMAIL
     "private_key": "-----BEGIN PRIVATE KEY-----\n..."  // → FIREBASE_PRIVATE_KEY
   }
   ```

5. **IMPORTANT: Format Private Key Correctly**
   - The private key must include `\n` for newlines
   - Wrap in double quotes in `.env.local`
   - Example: `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXX\n-----END PRIVATE KEY-----\n"`

6. **Get FCM Server Key**
   - Go to Project Settings → Cloud Messaging
   - Copy "Server key" → Add as `FCM_SERVER_KEY`

### 7. Web Push VAPID Keys (OPTIONAL - For Web Push Notifications)

**Only needed for browser push notifications**

```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Copy output:
# Public Key → NEXT_PUBLIC_VAPID_PUBLIC_KEY
# Private Key → VAPID_PRIVATE_KEY
```

### 8. OpenAI API (OPTIONAL - For n8n Workflow)

**Only needed if using the n8n analyst post processing workflow**

1. Go to: https://platform.openai.com/api-keys
2. Create a new API key
3. Copy to `.env.local` as `OPENAI_API_KEY`

## Verification

### Test Database Connections

```bash
# Test PostgreSQL connection
npm run db:studio
# Should open Prisma Studio at http://localhost:5555

# Test Redis connection
npm run redis:init
# Should seed Redis with analyst data
```

### Test Authentication

```bash
# Start development server
npm run dev:local

# Navigate to http://localhost:3000
# Click "Login with Discord"
# Should redirect to Discord OAuth flow
```

### Verify Environment Variables

```bash
# Create a test script to verify env vars are loaded
node -e "console.log(process.env.DATABASE_URL ? '✓ DATABASE_URL set' : '✗ DATABASE_URL missing')"
```

## Minimal Configuration (To Get Started)

**You only need these 5 variables to run the app locally:**

1. `DATABASE_URL` - PostgreSQL connection
2. `REDIS_URL` - Redis connection
3. `NEXTAUTH_URL` - http://localhost:3000
4. `NEXTAUTH_SECRET` - Generated random string
5. `DISCORD_CLIENT_ID` - Discord OAuth
6. `DISCORD_CLIENT_SECRET` - Discord OAuth
7. `DISCORD_SERVER_ID` - Your Discord server

Everything else is optional and can be added later as needed.

## Troubleshooting

### "Failed to parse private key" (Firebase)

**Problem**: Firebase private key format is incorrect

**Solution**:
```bash
# Ensure the key includes escaped newlines (\n)
# Correct format:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n"

# Incorrect format (will fail):
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIB...
-----END PRIVATE KEY-----"
```

### "Could not connect to database" (PostgreSQL)

**Check if PostgreSQL is running**:
```bash
# macOS/Linux
pg_isready

# Or check with psql
psql -U postgres -d unity_oracle
```

**Check connection string format**:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### "Redis connection refused"

**Check if Redis is running**:
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### "OAuth error: invalid_client" (Discord)

**Common causes**:
1. Client ID or Client Secret is incorrect
2. Redirect URL doesn't match what's in Discord Developer Portal
3. Application not saved in Discord Developer Portal

**Solution**: Double-check all values in Discord Developer Portal

## Next Steps

After environment setup:

1. **Run database migrations**:
   ```bash
   npm run db:push
   ```

2. **Seed initial data**:
   ```bash
   npm run redis:init
   ```

3. **Start development server**:
   ```bash
   npm run dev:local
   ```

4. **Access the app**: http://localhost:3000

## Production Deployment

For production deployment, set these additional environment variables:

```bash
# Production URLs
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"

# Disable debug logging
NEXT_PUBLIC_DEBUG="false"

# Use real data sources
NEXT_PUBLIC_USE_MOCK_DATA="false"
```

## Security Notes

⚠️ **NEVER commit `.env.local` to version control**

✅ `.env.local` is already in `.gitignore`

✅ Use environment variables in your hosting platform (Vercel, Railway, etc.)

✅ Rotate secrets regularly (especially after team member changes)

✅ Use different keys for development and production

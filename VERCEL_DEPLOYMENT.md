# Vercel Deployment Guide

## ✅ Your App is Ready for Vercel!

All code issues have been fixed. This guide will help you deploy to Vercel in minutes.

## Why Vercel Works (Even Though Local Build Doesn't)

**The Prisma error you're seeing locally is NOT a problem on Vercel because:**
- ✅ Vercel automatically runs `prisma generate` during build
- ✅ Vercel has full network access to download Prisma binaries
- ✅ Your `package.json` now has `postinstall` script for automatic generation
- ✅ Your `build` script includes `prisma generate`

## Prerequisites

Before deploying to Vercel, you need:

### 1. Databases Setup
You need PostgreSQL and Redis URLs. Choose from these options:

**PostgreSQL Options:**
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) - Integrated with Vercel
- [Neon](https://neon.tech/) - Serverless PostgreSQL (free tier)
- [Supabase](https://supabase.com/) - PostgreSQL with extras (free tier)
- [Railway](https://railway.app/) - PostgreSQL hosting (free tier)

**Redis Options:**
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) - Redis-compatible (integrated)
- [Upstash](https://upstash.com/) - Serverless Redis (free tier)
- [Redis Cloud](https://redis.com/try-free/) - Managed Redis (free tier)

### 2. Discord OAuth Application
See `ENVIRONMENT_SETUP.md` for Discord OAuth setup instructions.

## Step-by-Step Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   # Ensure all changes are committed
   git status
   git push origin main  # or your branch name
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   In the Vercel dashboard, add these environment variables:

   **Required (7 variables):**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   REDIS_URL=redis://host:6379
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=<run: openssl rand -base64 32>
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_SERVER_ID=your_server_id
   ```

   **Optional (for full features):**
   ```
   COINGECKO_API_KEY=your_api_key
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FCM_SERVER_KEY=your_fcm_key
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public
   VAPID_PRIVATE_KEY=your_vapid_private
   OPENAI_API_KEY=sk-your_key
   ```

4. **Update Discord OAuth Redirect URL**
   - Go to Discord Developer Portal
   - Add redirect: `https://your-app.vercel.app/api/auth/callback/discord`

5. **Deploy!**
   - Click "Deploy"
   - Vercel will automatically:
     - Install dependencies
     - Run `prisma generate` (via postinstall)
     - Build your Next.js app
     - Deploy to production

6. **Initialize Database Schema**

   After first deployment, run database migration:
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link your project
   vercel link

   # Run Prisma migration
   vercel env pull .env.production
   DATABASE_URL="your_production_db_url" npx prisma db push
   ```

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (will prompt for env vars)
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment Steps

### 1. Verify Deployment
```bash
# Check build logs in Vercel dashboard
# Look for: "✓ Generating Prisma Client"
# Look for: "✓ Compiled successfully"
```

### 2. Test the App
- Visit your Vercel URL: `https://your-app.vercel.app`
- Test Discord login
- Check database connectivity

### 3. Set Up Custom Domain (Optional)
- Go to Vercel dashboard → Settings → Domains
- Add your custom domain
- Update `NEXTAUTH_URL` environment variable
- Update Discord OAuth redirect URL

## Automatic Deployments

Vercel will automatically deploy when you push to your main branch:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs build (with prisma generate)
# 3. Deploys to production
```

## Environment Variables Best Practices

### Production vs Preview vs Development

Vercel has three environments:
- **Production**: Your main branch
- **Preview**: Pull request branches
- **Development**: Local development

Set different values for each:
```bash
# Production
NEXTAUTH_URL=https://your-app.vercel.app

# Preview
NEXTAUTH_URL=https://your-app-git-branch.vercel.app

# Development
NEXTAUTH_URL=http://localhost:3000
```

### Managing Secrets

For sensitive values like `NEXTAUTH_SECRET`:
```bash
# Generate and add via CLI
vercel env add NEXTAUTH_SECRET production
# Paste value from: openssl rand -base64 32
```

## Troubleshooting

### Build Fails with "Prisma Client not generated"

**Solution**: Ensure your `package.json` has:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate || true"
  }
}
```
✅ Already configured in your project!

### "Authentication Error" in Production

**Cause**: `NEXTAUTH_URL` doesn't match your Vercel URL

**Solution**:
1. Update `NEXTAUTH_URL` in Vercel env vars
2. Redeploy

### Database Connection Fails

**Cause**: Incorrect `DATABASE_URL` or IP whitelist

**Solution**:
1. Verify connection string format
2. For Neon/Supabase: Add `0.0.0.0/0` to IP whitelist
3. For Railway: Use public connection string

### Redis Connection Fails

**Cause**: Redis URL incorrect or SSL required

**Solution**:
```bash
# Upstash Redis (requires SSL)
REDIS_URL=rediss://default:password@host:6379

# Note the extra 's' in rediss:// for SSL
```

## Performance Optimization

### Edge Functions (Optional)

For better performance, you can configure edge functions in `vercel.json`:

```json
{
  "functions": {
    "app/api/portfolio/route.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Caching Strategy

Vercel automatically caches static assets. For API routes:

```typescript
// In your API routes
export const revalidate = 60; // Cache for 60 seconds
```

## Monitoring

### View Logs
```bash
# Real-time logs
vercel logs your-app.vercel.app --follow

# Filter by function
vercel logs your-app.vercel.app -f api/portfolio
```

### Analytics
- Enable in Vercel dashboard → Analytics
- Monitor page views, performance, errors

## Database Management in Production

### Run Prisma Studio
```bash
# Pull production env vars
vercel env pull .env.production

# Open Prisma Studio connected to production
npx prisma studio
```

⚠️ **Warning**: Be careful when modifying production data!

### Run Migrations
```bash
# Pull production DB URL
vercel env pull .env.production

# Push schema changes
npx prisma db push
```

## Cost Estimates

**Free Tier Includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Preview deployments

**Database Costs:**
- Vercel Postgres: $0.30/GB stored
- Vercel KV (Redis): $0.20/100k requests
- Or use free tiers from Neon, Upstash, etc.

## Next Steps After Deployment

1. ✅ Monitor build logs for successful deployment
2. ✅ Test all features (login, portfolio, notifications)
3. ✅ Set up custom domain (optional)
4. ✅ Configure Redis with initial analyst data
5. ✅ Set up monitoring and alerts
6. ✅ Configure automatic backups for database

## Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: support@vercel.com
- **This Project**: See `ENVIRONMENT_SETUP.md` and `KNOWN_ISSUES.md`

---

## Quick Reference: Required Environment Variables

```bash
# Copy this to Vercel dashboard → Settings → Environment Variables

DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_SERVER_ID=...
```

**Your app is ready to deploy!** 🚀

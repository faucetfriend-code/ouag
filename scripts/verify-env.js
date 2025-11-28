#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 *
 * Checks which environment variables are configured and provides
 * guidance on missing required variables.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const REQUIRED_VARS = [
  { name: 'DATABASE_URL', description: 'PostgreSQL database connection', required: true },
  { name: 'REDIS_URL', description: 'Redis cache connection', required: true },
  { name: 'NEXTAUTH_URL', description: 'Application URL for NextAuth', required: true },
  { name: 'NEXTAUTH_SECRET', description: 'Secret for JWT signing', required: true },
  { name: 'DISCORD_CLIENT_ID', description: 'Discord OAuth Client ID', required: true },
  { name: 'DISCORD_CLIENT_SECRET', description: 'Discord OAuth Client Secret', required: true },
  { name: 'DISCORD_SERVER_ID', description: 'Discord Server ID for membership check', required: true },
];

const OPTIONAL_VARS = [
  { name: 'COINGECKO_API_KEY', description: 'CoinGecko API key (optional, free tier works without)' },
  { name: 'FIREBASE_PROJECT_ID', description: 'Firebase project ID (for mobile push)' },
  { name: 'FIREBASE_CLIENT_EMAIL', description: 'Firebase service account email' },
  { name: 'FIREBASE_PRIVATE_KEY', description: 'Firebase service account private key' },
  { name: 'FCM_SERVER_KEY', description: 'Firebase Cloud Messaging server key' },
  { name: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY', description: 'Web Push VAPID public key' },
  { name: 'VAPID_PRIVATE_KEY', description: 'Web Push VAPID private key' },
  { name: 'OPENAI_API_KEY', description: 'OpenAI API key (for n8n workflow)' },
];

console.log('\n🔍 Unity Oracle Aggregator - Environment Verification\n');
console.log('=' .repeat(70));

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('\n❌ .env.local file not found!');
  console.log('\n📝 Create .env.local file in project root and configure your environment variables.');
  console.log('   See ENVIRONMENT_SETUP.md for detailed setup instructions.\n');
  process.exit(1);
}

console.log('✅ .env.local file found\n');

// Check required variables
console.log('\n📋 REQUIRED Environment Variables\n');
console.log('-'.repeat(70));

let missingRequired = 0;

REQUIRED_VARS.forEach(({ name, description, required }) => {
  const value = process.env[name];
  const isSet = value && value.trim() !== '' && !value.includes('your_') && !value.includes('generate-this');

  if (isSet) {
    console.log(`✅ ${name.padEnd(25)} ${description}`);

    // Validate specific formats
    if (name === 'DATABASE_URL' && !value.startsWith('postgresql://')) {
      console.log(`   ⚠️  Warning: Should start with postgresql://`);
    }
    if (name === 'REDIS_URL' && !value.startsWith('redis://')) {
      console.log(`   ⚠️  Warning: Should start with redis://`);
    }
    if (name === 'NEXTAUTH_SECRET' && value.length < 32) {
      console.log(`   ⚠️  Warning: Should be at least 32 characters (generate with: openssl rand -base64 32)`);
    }
  } else {
    console.log(`❌ ${name.padEnd(25)} ${description}`);
    missingRequired++;
  }
});

// Check optional variables
console.log('\n📋 OPTIONAL Environment Variables\n');
console.log('-'.repeat(70));

let configuredOptional = 0;

OPTIONAL_VARS.forEach(({ name, description }) => {
  const value = process.env[name];
  const isSet = value && value.trim() !== '' && !value.includes('your_') && !value.includes('generate-this');

  if (isSet) {
    console.log(`✅ ${name.padEnd(30)} ${description}`);
    configuredOptional++;
  } else {
    console.log(`⚪ ${name.padEnd(30)} ${description}`);
  }
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n📊 Summary\n');

if (missingRequired === 0) {
  console.log('✅ All required environment variables are configured!');
  console.log(`✅ ${configuredOptional}/${OPTIONAL_VARS.length} optional variables configured`);

  console.log('\n🚀 Next Steps:\n');
  console.log('   1. Run database migrations:  npm run db:push');
  console.log('   2. Generate Prisma client:   npx prisma generate');
  console.log('   3. Seed Redis data:          npm run redis:init');
  console.log('   4. Start dev server:         npm run dev:local');
  console.log('   5. Visit:                    http://localhost:3000\n');
} else {
  console.log(`❌ ${missingRequired} required variable(s) missing`);
  console.log(`⚪ ${configuredOptional}/${OPTIONAL_VARS.length} optional variables configured`);

  console.log('\n📝 To configure missing variables:\n');
  console.log('   1. Edit .env.local in the project root');
  console.log('   2. See ENVIRONMENT_SETUP.md for setup instructions');
  console.log('   3. Run this script again: node scripts/verify-env.js\n');

  process.exit(1);
}

// Test database connections (if configured)
if (missingRequired === 0) {
  console.log('\n🔌 Testing Connections...\n');

  // Note: We can't actually test connections here without async,
  // but we provide guidance
  console.log('To test database connections:');
  console.log('   PostgreSQL: npm run db:studio');
  console.log('   Redis:      npm run redis:init');
  console.log('');
}

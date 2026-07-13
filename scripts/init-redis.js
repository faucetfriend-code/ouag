/**
 * Redis Initialization Script
 *
 * Sets up Redis database with initial data and performs health checks.
 * Run this script to initialize the database for the Unity Oracle Aggregator.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { redisService } = require('../lib/redis');

async function initializeDatabase() {
  console.log('🚀 Initializing Redis Database for Unity Oracle Aggregator\n');

  try {
    // Connect to Redis
    console.log('📡 Connecting to Redis...');
    await redisService.connect();

    // Health check
    console.log('🏥 Performing health check...');
    const isHealthy = await redisService.healthCheck();
    if (!isHealthy) {
      throw new Error('Redis health check failed');
    }
    console.log('✅ Redis is healthy\n');

    // Check if data already exists
    console.log('📊 Checking existing data...');
    const stats = await redisService.getAnalystStats();

    if (stats.totalPosts > 0) {
      console.log(`📈 Found existing data:`);
      console.log(`   • ${stats.totalPosts} posts`);
      console.log(`   • ${stats.activeAnalysts} analysts`);
      console.log(`   • ${stats.tokensTracked} tokens tracked`);
      console.log(`   • Latest update: ${stats.latestUpdate?.toLocaleString() || 'Never'}`);

      const clearData = process.argv.includes('--clear');
      if (clearData) {
        console.log('\n🗑️  Clearing existing data...');
        await redisService.clearAllData();
        console.log('✅ Data cleared');
      } else {
        console.log('\n💡 Use --clear flag to reset database');
        return;
      }
    }

    // Seed initial data
    console.log('\n🌱 Seeding initial data...');
    await redisService.seedInitialData();

    // Verify seeding
    const newStats = await redisService.getAnalystStats();
    console.log('✅ Initial data seeded:');
    console.log(`   • ${newStats.totalPosts} posts`);
    console.log(`   • ${newStats.activeAnalysts} analysts`);
    console.log(`   • ${newStats.tokensTracked} tokens tracked`);

    console.log('\n🎉 Database initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Configure webhook endpoints');
    console.log('   2. Set up external analysis service');
    console.log('   3. Start the application');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await redisService.disconnect();
  }
}

// Run initialization
initializeDatabase().catch(console.error);
/**
 * Test Script for Analyst Workflow
 *
 * Demonstrates the webhook processing workflow with sample data.
 */

const { analystWorkflow } = require('./lib/workflow.ts');

// Sample webhook payloads for testing
const testPayloads = [
  {
    platform: 'discord',
    content: '$BTC showing strong bullish signals above $58k resistance. Volume increasing significantly.',
    author: {
      id: '123456789',
      username: 'crypto_analyst',
      discriminator: '1234'
    },
    timestamp: new Date().toISOString(),
    channel: 'btc-analysis',
    id: 'discord_123456'
  },
  {
    platform: 'twitter',
    content: '$ETH breaking out of consolidation. Target $2100 by end of week. Strong momentum building.',
    author: {
      id: '987654321',
      username: 'eth_analyst'
    },
    timestamp: new Date().toISOString(),
    id: 'twitter_987654'
  },
  {
    platform: 'manual',
    content: `This is a much longer analysis post about $SOL that contains detailed technical analysis, fundamental factors, market sentiment, and trading strategies. The post discusses multiple timeframes, various indicators including RSI, MACD, moving averages, support and resistance levels, volume analysis, order flow, market microstructure, intermarket relationships, global macroeconomic factors, regulatory developments, adoption metrics, network upgrades, competitive landscape, tokenomics, staking rewards, DeFi integrations, NFT ecosystem growth, institutional interest, whale accumulation patterns, social sentiment analysis, on-chain metrics, exchange flows, futures market positioning, options market activity, and much more comprehensive analysis that would definitely exceed the character limit for short posts.`,
    author: {
      id: '555666777',
      username: 'comprehensive_analyst'
    },
    timestamp: new Date().toISOString(),
    channel: 'sol-analysis',
    id: 'manual_555666'
  }
];

async function testWorkflow() {
  console.log('🧪 Testing Analyst Workflow\n');

  for (const [index, payload] of testPayloads.entries()) {
    console.log(`\n📝 Test ${index + 1}: ${payload.platform.toUpperCase()} - ${payload.author.username}`);
    console.log(`Content: "${payload.content.substring(0, 100)}${payload.content.length > 100 ? '...' : ''}"`);

    try {
      const result = await analystWorkflow.processWebhookData(payload);

      console.log('✅ Processed successfully:');
      console.log(`   Token: ${result.token}`);
      console.log(`   Content Type: ${result.contentType}`);
      console.log(`   Sentiment: ${result.extractedData.sentiment} (${Math.round(result.extractedData.confidence * 100)}%)`);
      console.log(`   Original Length: ${result.originalLength} chars`);
      console.log(`   Chart Data Points: ${result.chartData?.length || 0}`);

      if (result.aiAnalysis) {
        console.log(`   AI Summary: "${result.aiAnalysis.summary}"`);
      }

    } catch (error) {
      console.error('❌ Processing failed:', error.message);
    }
  }

  console.log('\n🎉 Workflow testing complete!');
}

// Run the test
testWorkflow().catch(console.error);</content>
</xai:function_call">test-workflow.js
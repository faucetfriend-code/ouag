export interface TradingPost {
  id: string;
  user: string;
  channel: string;
  token: string;
  content: string;
  timestamp: Date;
  analysis?: string;
  chartData?: number[];
}

// Redis-based data fetching functions (Server-side only)
import 'server-only';
import { redisService } from '../lib/redis';

export async function getTradingPostsByToken(token: string): Promise<TradingPost[]> {
  try {
    const posts = await redisService.getPostsByToken(token);
    return posts.map(post => ({
      id: post.id,
      user: post.user,
      channel: post.channel,
      token: post.token,
      content: post.content,
      timestamp: post.timestamp,
      analysis: post.analysis,
      chartData: post.chartData
    }));
  } catch (error) {
    console.error('Error fetching posts from Redis:', error);
    // Fallback to mock data
    return mockTradingPosts.filter(post => post.token === token);
  }
}

export async function getChartDataForToken(token: string): Promise<number[] | undefined> {
  try {
    return await redisService.getChartData(token) || undefined;
  } catch (error) {
    console.error('Error fetching chart data from Redis:', error);
    // Fallback to mock data
    const tokenPosts = mockTradingPosts.filter(post => post.token === token);
    return tokenPosts.find(post => post.chartData)?.chartData;
  }
}

export async function getAllTokens(): Promise<string[]> {
  return tokens; // Static list for now
}

export async function getAnalystStats() {
  try {
    return await redisService.getAnalystStats();
  } catch (error) {
    console.error('Error fetching analyst stats from Redis:', error);
    // Fallback stats
    return {
      totalPosts: mockTradingPosts.length,
      activeAnalysts: new Set(mockTradingPosts.map(p => p.user)).size,
      tokensTracked: tokens.length,
      latestUpdate: new Date()
    };
  }
}

export const mockTradingPosts: TradingPost[] = [
  // BTC-Focused Analysts (3 users, mainly BTC)
  {
    id: '1',
    user: 'btc_analyst1',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC showing strong bullish signals, resistance at 60k.',
    timestamp: new Date('2023-10-01T10:00:00Z'),
    analysis: 'Technical analysis indicates potential breakout above $58k resistance.',
    chartData: [50000, 52000, 55000, 58000, 60000]
  },
  {
    id: '2',
    user: 'btc_analyst1',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'Updated BTC chart, bearish divergence spotted.',
    timestamp: new Date('2023-10-02T09:00:00Z'),
    analysis: 'Caution advised, potential reversal if volume doesn\'t confirm upward movement.',
    chartData: [60000, 59000, 58000, 57000, 56000]
  },
  {
    id: '3',
    user: 'btc_analyst1',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC testing key support levels around $55k.',
    timestamp: new Date('2023-10-03T14:30:00Z'),
    analysis: 'Strong buying pressure at support, RSI showing oversold conditions.',
    chartData: [55000, 54500, 55500, 56000, 55800]
  },
  {
    id: '4',
    user: 'btc_analyst2',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC momentum shifting, volume increasing on upticks.',
    timestamp: new Date('2023-10-01T16:45:00Z'),
    analysis: 'MACD crossover bullish, potential for 10-15% move in next 48 hours.',
    chartData: [52000, 53500, 54000, 54500, 55000]
  },
  {
    id: '5',
    user: 'btc_analyst2',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC breaking out of descending triangle pattern.',
    timestamp: new Date('2023-10-04T11:20:00Z'),
    analysis: 'Pattern completion suggests target of $62k, stop loss below $53k.',
    chartData: [54000, 55000, 56000, 57000, 58000]
  },
  {
    id: '6',
    user: 'btc_analyst3',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC showing accumulation patterns, institutional interest rising.',
    timestamp: new Date('2023-10-02T08:15:00Z'),
    analysis: 'Whale activity increased 40% this week, positive for long-term holders.',
    chartData: [51000, 51500, 52500, 53000, 53500]
  },
  {
    id: '7',
    user: 'btc_analyst3',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC approaching major resistance, watch for rejection or breakout.',
    timestamp: new Date('2023-10-05T13:00:00Z'),
    analysis: 'Fibonacci extension levels suggest $63k as next major target.',
    chartData: [57000, 57500, 58000, 58500, 59000]
  },

  // Mixed Analysts (12 users with 30-45% token overlap)
  {
    id: '8',
    user: 'crypto_watcher',
    channel: 'eth-discussion',
    token: 'ETH',
    content: 'ETH consolidating after recent pump, testing $1900 resistance.',
    timestamp: new Date('2023-10-01T11:00:00Z'),
    analysis: 'Support levels holding, watch for volume confirmation on breakout.',
    chartData: [1800, 1900, 1850, 1950, 2000]
  },
  {
    id: '9',
    user: 'crypto_watcher',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC and ETH showing correlated strength, altcoin season approaching?',
    timestamp: new Date('2023-10-03T15:30:00Z'),
    analysis: 'ETH/BTC ratio improving, positive signal for broader market.',
    chartData: [56000, 56500, 57000, 57500, 58000]
  },
  {
    id: '10',
    user: 'crypto_watcher',
    channel: 'altcoins',
    token: 'ADA',
    content: 'ADA breaking out of downtrend, volume increasing.',
    timestamp: new Date('2023-10-04T10:15:00Z'),
    analysis: 'Cardano ecosystem upgrades driving renewed interest.',
    chartData: [0.35, 0.38, 0.40, 0.42, 0.45]
  },
  {
    id: '11',
    user: 'defi_expert',
    channel: 'defi-analysis',
    token: 'UNI',
    content: 'UNI showing strong recovery, DeFi TVL increasing.',
    timestamp: new Date('2023-10-01T14:20:00Z'),
    analysis: 'Uniswap volume up 25%, positive for UNI token performance.',
    chartData: [4.50, 4.80, 5.10, 5.20, 5.40]
  },
  {
    id: '12',
    user: 'defi_expert',
    channel: 'eth-discussion',
    token: 'ETH',
    content: 'ETH staking rewards becoming more attractive as yields rise.',
    timestamp: new Date('2023-10-02T16:00:00Z'),
    analysis: 'Institutional adoption driving staking demand, bullish for ETH.',
    chartData: [1850, 1880, 1920, 1950, 1980]
  },
  {
    id: '13',
    user: 'defi_expert',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC dominance decreasing, rotation into altcoins beginning.',
    timestamp: new Date('2023-10-05T09:45:00Z'),
    analysis: 'Market cap distribution shifting, watch for altcoin momentum.',
    chartData: [58000, 58200, 58500, 58800, 59000]
  },
  {
    id: '14',
    user: 'tech_analyst',
    channel: 'technical-analysis',
    token: 'SOL',
    content: 'SOL breaking key resistance levels, momentum building.',
    timestamp: new Date('2023-10-01T12:30:00Z'),
    analysis: 'Relative strength index showing bullish divergence.',
    chartData: [25.50, 26.80, 27.20, 28.50, 29.80]
  },
  {
    id: '15',
    user: 'tech_analyst',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC technical indicators aligning for upward move.',
    timestamp: new Date('2023-10-03T17:15:00Z'),
    analysis: 'Multiple timeframe analysis shows convergence at resistance.',
    chartData: [55500, 56000, 56500, 57000, 57500]
  },
  {
    id: '16',
    user: 'tech_analyst',
    channel: 'altcoins',
    token: 'LINK',
    content: 'LINK testing multi-month highs, oracle network expanding.',
    timestamp: new Date('2023-10-04T08:00:00Z'),
    analysis: 'Chainlink adoption growing across DeFi protocols.',
    chartData: [8.20, 8.50, 8.80, 9.10, 9.40]
  },
  {
    id: '17',
    user: 'market_maverick',
    channel: 'market-analysis',
    token: 'DOGE',
    content: 'DOGE showing unusual volume, meme coin season heating up.',
    timestamp: new Date('2023-10-02T13:45:00Z'),
    analysis: 'Social sentiment extremely bullish, watch for viral momentum.',
    chartData: [0.065, 0.068, 0.072, 0.075, 0.078]
  },
  {
    id: '18',
    user: 'market_maverick',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC as safe haven play while altcoins volatile.',
    timestamp: new Date('2023-10-04T19:30:00Z'),
    analysis: 'Risk-off environment favoring BTC over speculative assets.',
    chartData: [56500, 56700, 56900, 57100, 57300]
  },
  {
    id: '19',
    user: 'market_maverick',
    channel: 'altcoins',
    token: 'DOT',
    content: 'DOT governance upgrades driving renewed interest.',
    timestamp: new Date('2023-10-05T11:30:00Z'),
    analysis: 'Polkadot parachain ecosystem expanding rapidly.',
    chartData: [4.80, 4.95, 5.10, 5.25, 5.40]
  },
  {
    id: '20',
    user: 'blockchain_dev',
    channel: 'layer1-analysis',
    token: 'AVAX',
    content: 'AVAX subnet activity increasing, network effects building.',
    timestamp: new Date('2023-10-01T15:10:00Z'),
    analysis: 'Avalanche ecosystem growth outpacing competitors.',
    chartData: [12.50, 13.20, 13.80, 14.10, 14.50]
  },
  {
    id: '21',
    user: 'blockchain_dev',
    channel: 'eth-discussion',
    token: 'ETH',
    content: 'ETH layer 2 solutions gaining traction, reducing congestion.',
    timestamp: new Date('2023-10-03T10:25:00Z'),
    analysis: 'Arbitrum and Optimism TVL growth positive for ETH utility.',
    chartData: [1900, 1920, 1940, 1960, 1980]
  },
  {
    id: '22',
    user: 'blockchain_dev',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC network hashrate at all-time highs, security strong.',
    timestamp: new Date('2023-10-05T14:45:00Z'),
    analysis: 'Mining difficulty adjustment incoming, bullish for network security.',
    chartData: [57500, 57700, 57900, 58100, 58300]
  },
  {
    id: '23',
    user: 'yield_farmer',
    channel: 'yield-farming',
    token: 'MATIC',
    content: 'MATIC gas fees lowest in months, ecosystem flourishing.',
    timestamp: new Date('2023-10-02T09:30:00Z'),
    analysis: 'Polygon zkEVM launch driving renewed adoption.',
    chartData: [0.85, 0.88, 0.92, 0.95, 0.98]
  },
  {
    id: '24',
    user: 'yield_farmer',
    channel: 'defi-analysis',
    token: 'UNI',
    content: 'UNI liquidity mining rewards attracting new users.',
    timestamp: new Date('2023-10-04T12:00:00Z'),
    analysis: 'Uniswap v3 adoption increasing, positive for UNI token.',
    chartData: [5.10, 5.25, 5.40, 5.55, 5.70]
  },
  {
    id: '25',
    user: 'yield_farmer',
    channel: 'altcoins',
    token: 'ADA',
    content: 'ADA staking rewards competitive, attracting HODLers.',
    timestamp: new Date('2023-10-05T16:20:00Z'),
    analysis: 'Cardano delegation rate at 70%, strong network participation.',
    chartData: [0.38, 0.40, 0.42, 0.44, 0.46]
  },
  {
    id: '26',
    user: 'nft_trader',
    channel: 'nft-market',
    token: 'ETH',
    content: 'ETH NFT marketplace volume recovering, blue-chip collections strong.',
    timestamp: new Date('2023-10-01T18:00:00Z'),
    analysis: 'OpenSea and Blur competition driving innovation.',
    chartData: [1820, 1850, 1880, 1910, 1940]
  },
  {
    id: '27',
    user: 'nft_trader',
    channel: 'altcoins',
    token: 'SOL',
    content: 'SOL NFT ecosystem booming, Magic Eden volume surging.',
    timestamp: new Date('2023-10-03T20:15:00Z'),
    analysis: 'Solana NFT standard gaining traction over Ethereum.',
    chartData: [27.50, 28.20, 28.80, 29.30, 29.90]
  },
  {
    id: '28',
    user: 'nft_trader',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC Ordinals inscriptions driving network activity.',
    timestamp: new Date('2023-10-05T07:30:00Z'),
    analysis: 'Bitcoin NFTs creating new use case for BTC.',
    chartData: [57200, 57400, 57600, 57800, 58000]
  },
  {
    id: '29',
    user: 'quant_trader',
    channel: 'quant-analysis',
    token: 'LINK',
    content: 'LINK correlation with DeFi TVL showing strong positive relationship.',
    timestamp: new Date('2023-10-02T14:50:00Z'),
    analysis: 'Quantitative analysis suggests LINK undervalued at current levels.',
    chartData: [8.40, 8.60, 8.80, 9.00, 9.20]
  },
  {
    id: '30',
    user: 'quant_trader',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC volatility contraction suggesting imminent big move.',
    timestamp: new Date('2023-10-04T15:40:00Z'),
    analysis: 'Bollinger bands tightening, breakout likely in next 24-48 hours.',
    chartData: [56800, 57000, 57200, 57400, 57600]
  },
  {
    id: '31',
    user: 'quant_trader',
    channel: 'altcoins',
    token: 'DOT',
    content: 'DOT on-chain metrics showing accumulation by large holders.',
    timestamp: new Date('2023-10-05T18:10:00Z'),
    analysis: 'Whale accumulation index at 2-year high, bullish signal.',
    chartData: [5.00, 5.15, 5.30, 5.45, 5.60]
  },
  {
    id: '32',
    user: 'institutional_research',
    channel: 'institutional-analysis',
    token: 'ETH',
    content: 'ETH institutional adoption accelerating, ETF discussions heating up.',
    timestamp: new Date('2023-10-01T21:30:00Z'),
    analysis: 'BlackRock and Fidelity positioning suggests spot ETH ETF likely.',
    chartData: [1870, 1890, 1910, 1930, 1950]
  },
  {
    id: '33',
    user: 'institutional_research',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC ETF inflows continuing, institutional demand strong.',
    timestamp: new Date('2023-10-03T22:00:00Z'),
    analysis: 'Weekly ETF flows positive, accumulation phase continuing.',
    chartData: [57800, 58000, 58200, 58400, 58600]
  },
  {
    id: '34',
    user: 'institutional_research',
    channel: 'layer1-analysis',
    token: 'AVAX',
    content: 'AVAX institutional interest growing, enterprise adoption increasing.',
    timestamp: new Date('2023-10-05T12:15:00Z'),
    analysis: 'Fortune 500 companies exploring Avalanche for enterprise solutions.',
    chartData: [13.80, 14.00, 14.20, 14.40, 14.60]
  },
  {
    id: '35',
    user: 'social_sentiment',
    channel: 'social-analysis',
    token: 'DOGE',
    content: 'DOGE social mentions at 6-month high, viral potential building.',
    timestamp: new Date('2023-10-02T19:45:00Z'),
    analysis: 'Twitter sentiment analysis shows 75% positive mentions.',
    chartData: [0.066, 0.069, 0.072, 0.075, 0.078]
  },
  {
    id: '36',
    user: 'social_sentiment',
    channel: 'market-analysis',
    token: 'MATIC',
    content: 'MATIC social buzz increasing, developer activity surging.',
    timestamp: new Date('2023-10-04T17:25:00Z'),
    analysis: 'GitHub commits up 40%, positive for long-term development.',
    chartData: [0.88, 0.91, 0.94, 0.97, 1.00]
  },
  {
    id: '37',
    user: 'social_sentiment',
    channel: 'btc-analysis',
    token: 'BTC',
    content: 'BTC social dominance decreasing, altcoin season confirmed.',
    timestamp: new Date('2023-10-05T20:50:00Z'),
    analysis: 'Social media analysis shows rotation out of BTC into alts.',
    chartData: [58300, 58500, 58700, 58900, 59100]
  }
];

export const tokens = ['BTC', 'ETH', 'ADA', 'SOL', 'DOGE', 'LINK', 'UNI', 'AVAX', 'MATIC', 'DOT'];
/**
 * News Data Layer
 *
 * Provides data access for Crypto News Feed
 * Currently uses mock data. Will be connected to separate Redis database/n8n workflow in the future.
 *
 * TODO: Connect to News workflow + Redis database
 * TODO: Set up news aggregation from multiple sources (CoinDesk, CoinTelegraph, Twitter, etc.)
 */

export type NewsCategory = 'Market' | 'Technology' | 'Regulation' | 'DeFi' | 'NFT' | 'General';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  source: string;
  sourceUrl: string;
  category: NewsCategory;
  tags: string[];
  publishedAt: Date;
  imageUrl?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

// Mock news articles
const mockNewsArticles: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Bitcoin Breaks $60K Resistance, Bulls Eye $65K Target',
    summary: 'Bitcoin surged past the critical $60,000 resistance level today, marking its highest price point in two months amid strong institutional demand.',
    content: 'Bitcoin has successfully broken through the $60,000 resistance level, a key psychological barrier that has held for the past several weeks...',
    author: 'Sarah Chen',
    source: 'CryptoDaily',
    sourceUrl: 'https://example.com/btc-60k',
    category: 'Market',
    tags: ['Bitcoin', 'Price', 'Technical Analysis'],
    publishedAt: new Date(Date.now() - 2 * 3600000),
    imageUrl: undefined,
    sentiment: 'bullish',
  },
  {
    id: 'news-2',
    title: 'Ethereum 2.0 Staking Reaches New All-Time High',
    summary: 'The amount of ETH staked in Ethereum 2.0 contracts has reached a new record, signaling strong confidence in the network upgrade.',
    content: 'Ethereum staking has hit unprecedented levels as more holders lock up their ETH in anticipation of network improvements...',
    author: 'Michael Rodriguez',
    source: 'CoinTelegraph',
    sourceUrl: 'https://example.com/eth-staking',
    category: 'Technology',
    tags: ['Ethereum', 'ETH2.0', 'Staking'],
    publishedAt: new Date(Date.now() - 5 * 3600000),
    imageUrl: undefined,
    sentiment: 'bullish',
  },
  {
    id: 'news-3',
    title: 'SEC Delays Decision on Spot Bitcoin ETF Applications',
    summary: 'The Securities and Exchange Commission has postponed its decision on several spot Bitcoin ETF applications, pushing the timeline to Q1 2025.',
    content: 'In a move that surprised few market participants, the SEC has once again delayed its ruling on spot Bitcoin ETF applications...',
    author: 'Jennifer Wong',
    source: 'Bloomberg Crypto',
    sourceUrl: 'https://example.com/sec-etf',
    category: 'Regulation',
    tags: ['Bitcoin', 'ETF', 'SEC', 'Regulation'],
    publishedAt: new Date(Date.now() - 8 * 3600000),
    imageUrl: undefined,
    sentiment: 'bearish',
  },
  {
    id: 'news-4',
    title: 'DeFi Protocol Aave Launches v4 with Enhanced Security Features',
    summary: 'Leading DeFi lending protocol Aave has released version 4, featuring improved security measures and gas optimization.',
    content: 'Aave, one of the largest decentralized finance protocols, has officially launched its highly anticipated v4 upgrade...',
    author: 'David Kim',
    source: 'DeFi Pulse',
    sourceUrl: 'https://example.com/aave-v4',
    category: 'DeFi',
    tags: ['Aave', 'DeFi', 'Security', 'Upgrade'],
    publishedAt: new Date(Date.now() - 12 * 3600000),
    imageUrl: undefined,
    sentiment: 'bullish',
  },
  {
    id: 'news-5',
    title: 'Major NFT Marketplace Announces Zero-Fee Trading Period',
    summary: 'In a bid to attract more users, a leading NFT marketplace has announced a 30-day zero-fee trading promotion.',
    content: 'The competitive NFT marketplace landscape continues to heat up as one major player announces zero trading fees...',
    author: 'Emma Thompson',
    source: 'NFT Now',
    sourceUrl: 'https://example.com/nft-fees',
    category: 'NFT',
    tags: ['NFT', 'Marketplace', 'Fees'],
    publishedAt: new Date(Date.now() - 18 * 3600000),
    imageUrl: undefined,
    sentiment: 'neutral',
  },
  {
    id: 'news-6',
    title: 'Solana Network Experiences Brief Outage, Team Investigates',
    summary: 'The Solana blockchain experienced a brief period of degraded performance earlier today, with the team working to identify the root cause.',
    content: 'Solana validators reported connectivity issues this morning, resulting in a temporary slowdown of block production...',
    author: 'Alex Martinez',
    source: 'CryptoNews',
    sourceUrl: 'https://example.com/solana-outage',
    category: 'Technology',
    tags: ['Solana', 'Network', 'Outage'],
    publishedAt: new Date(Date.now() - 24 * 3600000),
    imageUrl: undefined,
    sentiment: 'bearish',
  },
  {
    id: 'news-7',
    title: 'Top 10 Cryptocurrencies by Market Cap See Green Across the Board',
    summary: 'All top 10 cryptocurrencies by market capitalization posted gains today, with average returns of 4.2% in the past 24 hours.',
    content: 'It has been a positive day for the cryptocurrency market, with all major assets posting gains...',
    author: 'Rachel Green',
    source: 'CoinMarketCap',
    sourceUrl: 'https://example.com/market-green',
    category: 'Market',
    tags: ['Market', 'Altcoins', 'Bull Run'],
    publishedAt: new Date(Date.now() - 6 * 3600000),
    imageUrl: undefined,
    sentiment: 'bullish',
  },
  {
    id: 'news-8',
    title: 'European Union Proposes New Crypto Taxation Framework',
    summary: 'EU lawmakers have proposed a comprehensive taxation framework for cryptocurrency transactions, aiming for implementation by 2026.',
    content: 'The European Union continues to refine its approach to cryptocurrency regulation with a new tax proposal...',
    author: 'Thomas Mueller',
    source: 'EuroCrypto',
    sourceUrl: 'https://example.com/eu-tax',
    category: 'Regulation',
    tags: ['EU', 'Taxation', 'Regulation'],
    publishedAt: new Date(Date.now() - 30 * 3600000),
    imageUrl: undefined,
    sentiment: 'neutral',
  },
  {
    id: 'news-9',
    title: 'Layer 2 Solutions Process Record Transaction Volume',
    summary: 'Ethereum Layer 2 scaling solutions have collectively processed over 10 million transactions in a single day for the first time.',
    content: 'The Ethereum scaling ecosystem continues to mature as Layer 2 solutions reach new milestones...',
    author: 'Lisa Chen',
    source: 'L2Beat',
    sourceUrl: 'https://example.com/l2-volume',
    category: 'Technology',
    tags: ['Ethereum', 'Layer2', 'Scaling'],
    publishedAt: new Date(Date.now() - 36 * 3600000),
    imageUrl: undefined,
    sentiment: 'bullish',
  },
  {
    id: 'news-10',
    title: 'Crypto Lending Platform Announces Institutional Custody Partnership',
    summary: 'A major crypto lending platform has partnered with a regulated custody provider to offer institutional-grade security.',
    content: 'In a move to attract more institutional clients, the lending platform has secured a partnership with a leading custody provider...',
    author: 'Mark Johnson',
    source: 'Institutional Crypto',
    sourceUrl: 'https://example.com/custody',
    category: 'General',
    tags: ['Lending', 'Custody', 'Institutional'],
    publishedAt: new Date(Date.now() - 48 * 3600000),
    imageUrl: undefined,
    sentiment: 'bullish',
  },
];

/**
 * Get latest news articles
 */
export async function getLatestNews(limit: number = 20): Promise<NewsArticle[]> {
  return mockNewsArticles
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}

/**
 * Get news by category
 */
export async function getNewsByCategory(category: NewsCategory, limit: number = 10): Promise<NewsArticle[]> {
  return mockNewsArticles
    .filter(article => article.category === category)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}

/**
 * Get news by sentiment
 */
export async function getNewsBySentiment(sentiment: 'bullish' | 'bearish' | 'neutral', limit: number = 10): Promise<NewsArticle[]> {
  return mockNewsArticles
    .filter(article => article.sentiment === sentiment)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}

/**
 * Search news by query
 */
export async function searchNews(query: string, limit: number = 10): Promise<NewsArticle[]> {
  const lowerQuery = query.toLowerCase();
  return mockNewsArticles
    .filter(article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.summary.toLowerCase().includes(lowerQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}

/**
 * Get news article by ID
 */
export async function getNewsById(id: string): Promise<NewsArticle | null> {
  return mockNewsArticles.find(article => article.id === id) || null;
}

/**
 * Get all unique categories
 */
export async function getNewsCategories(): Promise<NewsCategory[]> {
  return ['Market', 'Technology', 'Regulation', 'DeFi', 'NFT', 'General'];
}

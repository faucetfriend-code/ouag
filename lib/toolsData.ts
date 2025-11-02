/**
 * Tools Data Layer
 *
 * Provides data access for Trading Tools (Top Movers, Funding Rates, Volatility, etc.)
 * Currently uses mock data. Will be connected to separate Redis database/n8n workflow in the future.
 *
 * TODO: Connect to Tools workflow + Redis database
 * TODO: Set up separate data toggle for tools data
 */

export interface TopMover {
  token: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export interface FundingRate {
  token: string;
  exchange: string;
  rate: number;
  nextFunding: Date;
  predictedRate: number;
}

export interface VolatilityData {
  token: string;
  volatility7d: number;
  volatility30d: number;
  historicalVolatility: number[];
  lastUpdated: Date;
}

export interface LiquidationData {
  token: string;
  longLiquidations: number;
  shortLiquidations: number;
  totalLiquidations: number;
  timestamp: Date;
}

// Mock data for top movers
const mockTopMovers: TopMover[] = [
  { token: 'BTC', symbol: 'BTCUSDT', price: 58750, change24h: 5.42, volume24h: 28500000000, marketCap: 1150000000000 },
  { token: 'ETH', symbol: 'ETHUSDT', price: 1950, change24h: 3.21, volume24h: 12300000000, marketCap: 234000000000 },
  { token: 'SOL', symbol: 'SOLUSDT', price: 29.80, change24h: 8.95, volume24h: 1200000000, marketCap: 12500000000 },
  { token: 'AVAX', symbol: 'AVAXUSDT', price: 14.60, change24h: -2.34, volume24h: 450000000, marketCap: 5200000000 },
  { token: 'LINK', symbol: 'LINKUSDT', price: 9.20, change24h: 6.78, volume24h: 380000000, marketCap: 5100000000 },
  { token: 'MATIC', symbol: 'MATICUSDT', price: 0.98, change24h: -3.45, volume24h: 320000000, marketCap: 9100000000 },
  { token: 'DOT', symbol: 'DOTUSDT', price: 5.60, change24h: 4.12, volume24h: 250000000, marketCap: 7300000000 },
  { token: 'UNI', symbol: 'UNIUSDT', price: 5.40, change24h: -1.23, volume24h: 180000000, marketCap: 4100000000 },
];

// Mock data for funding rates
const mockFundingRates: FundingRate[] = [
  { token: 'BTC', exchange: 'Binance', rate: 0.0125, nextFunding: new Date(Date.now() + 4 * 3600000), predictedRate: 0.0132 },
  { token: 'BTC', exchange: 'Bybit', rate: 0.0118, nextFunding: new Date(Date.now() + 4 * 3600000), predictedRate: 0.0125 },
  { token: 'ETH', exchange: 'Binance', rate: 0.0089, nextFunding: new Date(Date.now() + 4 * 3600000), predictedRate: 0.0095 },
  { token: 'ETH', exchange: 'Bybit', rate: 0.0092, nextFunding: new Date(Date.now() + 4 * 3600000), predictedRate: 0.0098 },
  { token: 'SOL', exchange: 'Binance', rate: 0.0156, nextFunding: new Date(Date.now() + 4 * 3600000), predictedRate: 0.0162 },
  { token: 'SOL', exchange: 'Bybit', rate: 0.0149, nextFunding: new Date(Date.now() + 4 * 3600000), predictedRate: 0.0155 },
];

// Mock data for volatility
const mockVolatilityData: VolatilityData[] = [
  { token: 'BTC', volatility7d: 3.2, volatility30d: 4.5, historicalVolatility: [3.1, 3.4, 3.2, 3.5, 3.3, 3.2, 3.0], lastUpdated: new Date() },
  { token: 'ETH', volatility7d: 4.1, volatility30d: 5.2, historicalVolatility: [4.2, 4.3, 4.0, 4.5, 4.1, 3.9, 4.1], lastUpdated: new Date() },
  { token: 'SOL', volatility7d: 6.8, volatility30d: 8.3, historicalVolatility: [6.5, 7.0, 6.8, 7.2, 6.9, 6.7, 6.8], lastUpdated: new Date() },
  { token: 'AVAX', volatility7d: 5.4, volatility30d: 6.9, historicalVolatility: [5.2, 5.6, 5.4, 5.8, 5.5, 5.3, 5.4], lastUpdated: new Date() },
];

// Mock data for liquidations
const mockLiquidationData: LiquidationData[] = [
  { token: 'BTC', longLiquidations: 45000000, shortLiquidations: 32000000, totalLiquidations: 77000000, timestamp: new Date() },
  { token: 'ETH', longLiquidations: 28000000, shortLiquidations: 19000000, totalLiquidations: 47000000, timestamp: new Date() },
  { token: 'SOL', longLiquidations: 8500000, shortLiquidations: 5200000, totalLiquidations: 13700000, timestamp: new Date() },
];

/**
 * Get top movers (gainers and losers) in the past 24 hours
 */
export async function getTopMovers(limit: number = 10): Promise<TopMover[]> {
  // Sort by absolute change to get biggest movers
  return mockTopMovers
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, limit);
}

/**
 * Get funding rates across exchanges
 */
export async function getFundingRates(token?: string): Promise<FundingRate[]> {
  if (token) {
    return mockFundingRates.filter(r => r.token === token);
  }
  return mockFundingRates;
}

/**
 * Get volatility data for tokens
 */
export async function getVolatilityData(token?: string): Promise<VolatilityData[]> {
  if (token) {
    return mockVolatilityData.filter(v => v.token === token);
  }
  return mockVolatilityData;
}

/**
 * Get liquidation data
 */
export async function getLiquidationData(token?: string): Promise<LiquidationData[]> {
  if (token) {
    return mockLiquidationData.filter(l => l.token === token);
  }
  return mockLiquidationData;
}

/**
 * Get all available tools data for a specific token
 */
export async function getToolsDataForToken(token: string) {
  const [topMover, fundingRates, volatility, liquidations] = await Promise.all([
    getTopMovers(1).then(movers => movers.find(m => m.token === token)),
    getFundingRates(token),
    getVolatilityData(token),
    getLiquidationData(token),
  ]);

  return {
    topMover,
    fundingRates,
    volatility: volatility[0],
    liquidations: liquidations[0],
  };
}

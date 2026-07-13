/**
 * Portfolio API Endpoint
 *
 * Handles portfolio management operations including fetching portfolio data,
 * managing holdings, and real-time price updates.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SYMBOL_TO_COINGECKO_ID } from '@/lib/coingecko-mappings';

// CoinGecko API configuration
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

// Cache for price data (simple in-memory cache)
const priceCache = new Map<string, { price: number; lastUpdated: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CoinGeckoPriceData {
  usd?: number;
  usd_24h_change?: number;
}

interface PortfolioHolding {
  id: string;
  token: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  change24h: number;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioData {
  id: string;
  totalValue: number;
  totalChange24h: number;
  holdings: PortfolioHolding[];
  lastUpdated: string;
}

/**
 * GET /api/portfolio
 * Fetch user's portfolio with current holdings and prices
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: {
        holdings: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!portfolio) {
      // Return empty portfolio structure
      return NextResponse.json({
        id: null,
        totalValue: 0,
        totalChange24h: 0,
        holdings: [],
        lastUpdated: new Date().toISOString()
      });
    }

    // Get current prices for all tokens
    const tokenSymbols = portfolio.holdings.map((h: { token: string }) => h.token.toLowerCase());
    const prices = await getTokenPrices(tokenSymbols);

    // Calculate portfolio metrics
    let totalValue = 0;
    let totalChange24h = 0;

    const holdings: PortfolioHolding[] = portfolio.holdings.map((holding: { id: string; token: string; amount: number; avgPrice: number; createdAt: Date; updatedAt: Date }) => {
      const tokenKey = holding.token.toLowerCase();
      const currentPrice = prices[tokenKey]?.price || 0;
      const value = holding.amount * currentPrice;
      const change24h = prices[tokenKey]?.change24h || 0;

      totalValue += value;
      totalChange24h += (value * change24h) / 100;

      return {
        id: holding.id,
        token: holding.token,
        amount: holding.amount,
        avgPrice: holding.avgPrice,
        currentPrice,
        value,
        change24h,
        createdAt: holding.createdAt.toISOString(),
        updatedAt: holding.updatedAt.toISOString()
      };
    });

    const portfolioData: PortfolioData = {
      id: portfolio.id,
      totalValue,
      totalChange24h,
      holdings,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(portfolioData, { status: 200 });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

/**
 * POST /api/portfolio
 * Create or update user's portfolio
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { holdings } = body;

    if (!Array.isArray(holdings)) {
      return NextResponse.json({ error: 'Holdings must be an array' }, { status: 400 });
    }

    // Validate holdings data
    for (const holding of holdings) {
      if (!holding.token || typeof holding.amount !== 'number' || typeof holding.avgPrice !== 'number') {
        return NextResponse.json({
          error: 'Each holding must have token (string), amount (number), and avgPrice (number)'
        }, { status: 400 });
      }
    }

    // Create or update portfolio
    const portfolio = await prisma.portfolio.upsert({
      where: { userId: session.user.id },
      update: { updatedAt: new Date() },
      create: { userId: session.user.id },
      include: { holdings: true }
    });

    // Delete existing holdings
    await prisma.portfolioHolding.deleteMany({
      where: { portfolioId: portfolio.id }
    });

    // Create new holdings
    const newHoldings = await Promise.all(
      holdings.map(holding =>
        prisma.portfolioHolding.create({
          data: {
            portfolioId: portfolio.id,
            token: holding.token.toUpperCase(),
            amount: holding.amount,
            avgPrice: holding.avgPrice
          }
        })
      )
    );

    return NextResponse.json({
      portfolio: { ...portfolio, holdings: newHoldings },
      message: 'Portfolio updated successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating portfolio:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

/**
 * Fetch current prices for tokens from CoinGecko API
 */
async function getTokenPrices(tokenSymbols: string[]): Promise<Record<string, { price: number; change24h: number }>> {
  const prices: Record<string, { price: number; change24h: number }> = {};

  // Check cache first
  const now = Date.now();
  const uncachedSymbols: string[] = [];

  for (const symbol of tokenSymbols) {
    const cached = priceCache.get(symbol);
    if (cached && (now - cached.lastUpdated) < CACHE_DURATION) {
      prices[symbol] = { price: cached.price, change24h: 0 }; // Note: cache doesn't store change24h
    } else {
      uncachedSymbols.push(symbol);
    }
  }

  if (uncachedSymbols.length === 0) {
    return prices;
  }

  try {
    // Map symbols to CoinGecko IDs
    const coinIds = uncachedSymbols
      .map(symbol => SYMBOL_TO_COINGECKO_ID[symbol] || symbol)
      .filter(id => !uncachedSymbols.includes(id)); // Keep only successfully mapped IDs

    // Log warning for unmapped symbols
    const unmappedSymbols = uncachedSymbols.filter(symbol => !SYMBOL_TO_COINGECKO_ID[symbol]);
    if (unmappedSymbols.length > 0) {
      console.warn('Unmapped token symbols (prices unavailable):', unmappedSymbols.join(', '));
    }

    if (coinIds.length === 0) {
      return prices;
    }

    const idsParam = coinIds.join(',');
    const url = `${COINGECKO_API_BASE}/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`;

    const response = await fetch(url, {
      headers: COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {}
    });

    if (!response.ok) {
      console.warn('CoinGecko API error:', response.status);
      return prices;
    }

    const data = await response.json();

    // Map back to symbols and cache
    for (const [coinId, priceData] of Object.entries(data) as [string, CoinGeckoPriceData][]) {
      const symbol = Object.keys(SYMBOL_TO_COINGECKO_ID).find(key => SYMBOL_TO_COINGECKO_ID[key] === coinId) || coinId;

      if (priceData.usd) {
        prices[symbol] = {
          price: priceData.usd,
          change24h: priceData.usd_24h_change || 0
        };

        // Cache the price
        priceCache.set(symbol, {
          price: priceData.usd,
          lastUpdated: now
        });
      }
    }

  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
  }

  return prices;
}
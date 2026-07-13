/**
 * Portfolio Refresh API Endpoint
 *
 * Updates portfolio holdings with latest prices from external APIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SYMBOL_TO_COINGECKO_ID } from '@/lib/coingecko-mappings';

// CoinGecko API configuration
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

interface CoinGeckoPriceData {
  usd?: number;
  usd_24h_change?: number;
}

/**
 * POST /api/portfolio/refresh
 * Refresh portfolio prices and recalculate values
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's portfolio with holdings
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: { holdings: true }
    });

    if (!portfolio || portfolio.holdings.length === 0) {
      return NextResponse.json({
        message: 'No portfolio holdings to refresh',
        refreshed: 0
      }, { status: 200 });
    }

    // Get current prices for all tokens
    const tokenSymbols = portfolio.holdings.map((h: { token: string }) => h.token.toLowerCase());
    const prices = await getTokenPrices(tokenSymbols);

    // Update portfolio with latest data
    let refreshed = 0;
    const holdings: Array<{
      id: string;
      token: string;
      amount: number;
      avgPrice: number;
      currentPrice: number;
      value: number;
      change24h: number;
      lastUpdated: string;
    }> = [];

    for (const holding of portfolio.holdings) {
      const tokenKey = holding.token.toLowerCase();
      const priceData = prices[tokenKey];

      if (priceData) {
        // Update holding with current price (stored in database for reference)
        await prisma.portfolioHolding.update({
          where: { id: holding.id },
          data: { updatedAt: new Date() }
        });

        holdings.push({
          id: holding.id,
          token: holding.token,
          amount: holding.amount,
          avgPrice: holding.avgPrice,
          currentPrice: priceData.price,
          value: holding.amount * priceData.price,
          change24h: priceData.change24h,
          lastUpdated: new Date().toISOString()
        });

        refreshed++;
      } else {
        // Keep existing data if price fetch failed
        holdings.push({
          id: holding.id,
          token: holding.token,
          amount: holding.amount,
          avgPrice: holding.avgPrice,
          currentPrice: 0,
          value: 0,
          change24h: 0,
          lastUpdated: holding.updatedAt.toISOString()
        });
      }
    }

    // Calculate portfolio totals
    const totalValue = holdings.reduce((sum: number, h: { value: number }) => sum + h.value, 0);
    const totalChange24h = holdings.reduce((sum: number, h: { value: number; change24h: number }) => sum + (h.value * h.change24h / 100), 0);

    // Update portfolio timestamp
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      message: `Refreshed ${refreshed} holdings`,
      refreshed,
      totalValue,
      totalChange24h,
      holdings,
      lastUpdated: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Error refreshing portfolio:', error);
    return NextResponse.json({ error: 'Failed to refresh portfolio' }, { status: 500 });
  }
}

/**
 * Fetch current prices for tokens from CoinGecko API
 */
async function getTokenPrices(tokenSymbols: string[]): Promise<Record<string, { price: number; change24h: number }>> {
  const prices: Record<string, { price: number; change24h: number }> = {};

  try {
    // Map symbols to CoinGecko IDs
    const coinIds = tokenSymbols
      .map((symbol: string) => SYMBOL_TO_COINGECKO_ID[symbol] || symbol)
      .filter((id: string) => !tokenSymbols.includes(id)); // Keep only successfully mapped IDs

    // Log warning for unmapped symbols
    const unmappedSymbols = tokenSymbols.filter((symbol: string) => !SYMBOL_TO_COINGECKO_ID[symbol]);
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

    // Map back to symbols
    for (const [coinId, priceData] of Object.entries(data) as [string, CoinGeckoPriceData][]) {
      const symbol = Object.keys(SYMBOL_TO_COINGECKO_ID).find((key: string) => SYMBOL_TO_COINGECKO_ID[key] === coinId) || coinId.toLowerCase();

      if (priceData.usd) {
        prices[symbol] = {
          price: priceData.usd,
          change24h: priceData.usd_24h_change || 0
        };
      }
    }

  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
  }

  return prices;
}
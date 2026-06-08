import { NextRequest, NextResponse } from 'next/server';
import { botGet } from '@/lib/botClient';

/**
 * API Route for Funding Rates Tool
 *
 * Live source: the Discord Signal Bot's BloFin funding endpoint
 * (`/api/oracle/funding`). Falls back to mock data when the bot is not
 * configured/reachable. `type` selects positive (longs pay) or negative rates.
 */

interface FundingRow {
  token: string;
  exchange: string;
  rate: string;
  nextFunding: string;
  predicted: string;
}

interface BotFunding {
  symbol: string;
  rate: number; // decimal, e.g. 0.0001 == 0.01%
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'positive';
    const symbol = searchParams.get('symbol') || undefined; // optional comma list

    // --- Live: BloFin funding rates via the bot (defaults to open-position symbols) ---
    const bot = await botGet<BotFunding[]>('funding', { symbol });
    if (bot?.data?.length) {
      const rows: FundingRow[] = bot.data.map((f) => ({
        token: f.symbol.includes('USDT') ? f.symbol.replace('-', '/') : `${f.symbol}/USDT`,
        exchange: 'BloFin',
        rate: `${(f.rate * 100).toFixed(4)}%`,
        nextFunding: '—',
        predicted: '—',
      }));
      const data = rows.filter((r) =>
        type === 'negative' ? r.rate.startsWith('-') : !r.rate.startsWith('-'),
      );
      return NextResponse.json({ success: true, type, source: 'bot', data, timestamp: bot.timestamp });
    }

    // --- Fallback: mock data ---
    const mockPositive: FundingRow[] = [
      { token: 'BTC/USDT', exchange: 'Binance', rate: '0.0100%', nextFunding: '4:00 PM', predicted: '0.0098%' },
      { token: 'ETH/USDT', exchange: 'Binance', rate: '0.0085%', nextFunding: '4:00 PM', predicted: '0.0082%' },
      { token: 'SOL/USDT', exchange: 'Bybit', rate: '0.0120%', nextFunding: '4:00 PM', predicted: '0.0115%' },
      { token: 'BNB/USDT', exchange: 'Binance', rate: '0.0075%', nextFunding: '4:00 PM', predicted: '0.0073%' },
      { token: 'XRP/USDT', exchange: 'OKX', rate: '0.0095%', nextFunding: '4:00 PM', predicted: '0.0091%' },
      { token: 'ADA/USDT', exchange: 'Binance', rate: '0.0060%', nextFunding: '4:00 PM', predicted: '0.0058%' },
    ];
    const mockNegative: FundingRow[] = [
      { token: 'DOGE/USDT', exchange: 'Binance', rate: '-0.0082%', nextFunding: '4:00 PM', predicted: '-0.0079%' },
      { token: 'SHIB/USDT', exchange: 'Bybit', rate: '-0.0095%', nextFunding: '4:00 PM', predicted: '-0.0092%' },
      { token: 'AVAX/USDT', exchange: 'OKX', rate: '-0.0068%', nextFunding: '4:00 PM', predicted: '-0.0065%' },
      { token: 'MATIC/USDT', exchange: 'Binance', rate: '-0.0072%', nextFunding: '4:00 PM', predicted: '-0.0070%' },
      { token: 'DOT/USDT', exchange: 'Bybit', rate: '-0.0055%', nextFunding: '4:00 PM', predicted: '-0.0053%' },
      { token: 'UNI/USDT', exchange: 'Binance', rate: '-0.0061%', nextFunding: '4:00 PM', predicted: '-0.0059%' },
    ];
    const data = type === 'positive' ? mockPositive : mockNegative;
    return NextResponse.json({ success: true, type, source: 'mock', data, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching funding rates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

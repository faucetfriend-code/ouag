import { NextRequest, NextResponse } from 'next/server';
import { botGet, BotSignal } from '@/lib/botClient';

/**
 * API Route for Oracle Alerts Tool
 *
 * RSS-style feed of trading alerts. Live source: the Discord Signal Bot's
 * parsed-signal feed (`/api/oracle/signals`). Falls back to mock data when the
 * bot is not configured/reachable so the UI still renders in development.
 */

interface OracleAlert {
  id: string;
  token: string;
  pair: string;
  alertType: string;
  timeframe: string;
  description: string;
  price: string;
  timestamp: string;
  category: string;
}

/** Map a raw bot signal into the alert shape the UI expects. */
function signalToAlert(s: BotSignal, i: number): OracleAlert {
  const sym = (s.symbol || '').toUpperCase();
  const base = sym.replace(/[-/]?USDT.*$/i, '') || sym;
  const isStrategy = /oracle|rsi/i.test(s.analyst || '');
  const sideWord = (s.side || '').toLowerCase();
  const dir = sideWord.includes('long') || sideWord.includes('buy') ? 'Bullish'
    : sideWord.includes('short') || sideWord.includes('sell') ? 'Bearish' : '';
  return {
    id: `${s.ts}-${i}`,
    token: base,
    pair: sym.includes('USDT') ? sym.replace('-', '/') : `${base}/USDT`,
    alertType: isStrategy
      ? `OracleAlgo${dir ? ' ' + dir : ''} Signal`
      : `${s.analyst || 'Analyst'}${dir ? ' ' + dir : ''} Call`,
    timeframe: '—',
    description: s.raw_text || `${s.analyst} ${s.side} ${sym}`.trim(),
    price: '',
    timestamp: s.ts,
    category: isStrategy ? 'delta-volume' : 'market-structure',
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';

    // --- Live: pull recent parsed signals from the Discord Signal Bot ---
    const bot = await botGet<BotSignal[]>('signals', { limit: 60 });
    if (bot?.data) {
      const alerts = bot.data.map(signalToAlert);
      const data = filter === 'all' ? alerts : alerts.filter((a) => a.category === filter);
      return NextResponse.json({
        success: true,
        filter,
        source: 'bot',
        data,
        timestamp: bot.timestamp || new Date().toISOString(),
      });
    }

    // --- Fallback: mock data (bot not configured / unreachable) ---
    const mockAlerts: OracleAlert[] = [
      { id: '1', token: 'BTC', pair: 'BTC/USDT', alertType: 'Bearish Market Structure Break!', timeframe: '15M', description: 'A break of structure has been detected on the 15m timeframe. The price is breaking to the downside, suggesting bearish mid-timeframe momentum.', price: '101461.0', timestamp: '2025-11-07T08:45:00Z', category: 'market-structure' },
      { id: '2', token: 'BTC', pair: 'BTC/USDT', alertType: 'Bullish Market Structure Break!', timeframe: '15M', description: 'A break of structure has been detected on the 15m timeframe. The price is breaking to the upside, suggesting bullish mid-timeframe momentum.', price: '102515.4', timestamp: '2025-11-07T18:00:00Z', category: 'market-structure' },
      { id: '3', token: 'BTC', pair: 'BTC/USDT', alertType: 'Bullish Delta Volume!', timeframe: '4H', description: 'A bullish trend has been detected on the 4H timeframe. The price has had a strong hourly close to the upside, indicating a bullish LTF trend.', price: '125357.3', timestamp: '2025-10-06T16:00:00Z', category: 'delta-volume' },
      { id: '4', token: 'BTC', pair: 'BTC/USDT', alertType: 'Bearish Delta Volume!', timeframe: '4H', description: 'A bearish trend has been detected on the 4H timeframe. The price has had a weak 4H close to the downside, indicating bearish mid-timeframe pressure.', price: '124277.7', timestamp: '2025-10-07T00:00:00Z', category: 'delta-volume' },
      { id: '5', token: 'ETH', pair: 'ETH/USDT', alertType: 'Fast Move Alert', timeframe: '5M', description: 'Rapid price movement detected with significant volume increase.', price: '$3,825.50', timestamp: '2025-11-08T14:30:00Z', category: 'volatility' },
    ];
    const filteredData = filter === 'all' ? mockAlerts : mockAlerts.filter((a) => a.category === filter);

    return NextResponse.json({
      success: true,
      filter,
      source: 'mock',
      data: filteredData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching oracle alerts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

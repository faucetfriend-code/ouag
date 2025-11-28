import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for Oracle Alerts Tool
 *
 * RSS-style feed of trading alerts from OracleAlgo
 * Includes market structure breaks, delta volume, and volatility alerts
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';

    // TODO: Replace with actual Discord bot webhook/RSS feed
    // Could use Server-Sent Events (SSE) for real-time updates

    // Mock data for development
    const mockAlerts = [
      {
        id: '1',
        token: 'BTC',
        pair: 'BTC/USDT',
        alertType: 'Bearish Market Structure Break!',
        timeframe: '15M',
        description: 'A break of structure has been detected on the 15m timeframe. The price is breaking to the downside, suggesting bearish mid-timeframe momentum.',
        price: '101461.0',
        timestamp: '2025-11-07T08:45:00Z',
        category: 'market-structure'
      },
      {
        id: '2',
        token: 'BTC',
        pair: 'BTC/USDT',
        alertType: 'Bullish Market Structure Break!',
        timeframe: '15M',
        description: 'A break of structure has been detected on the 15m timeframe. The price is breaking to the upside, suggesting bullish mid-timeframe momentum.',
        price: '102515.4',
        timestamp: '2025-11-07T18:00:00Z',
        category: 'market-structure'
      },
      {
        id: '3',
        token: 'BTC',
        pair: 'BTC/USDT',
        alertType: 'Bullish Delta Volume!',
        timeframe: '4H',
        description: 'A bullish trend has been detected on the 4H timeframe. The price has had a strong hourly close to the upside, indicating a bullish LTF trend.',
        price: '125357.3',
        timestamp: '2025-10-06T16:00:00Z',
        category: 'delta-volume'
      },
      {
        id: '4',
        token: 'BTC',
        pair: 'BTC/USDT',
        alertType: 'Bearish Delta Volume!',
        timeframe: '4H',
        description: 'A bearish trend has been detected on the 4H timeframe. The price has had a weak 4H close to the downside, indicating bearish mid-timeframe pressure.',
        price: '124277.7',
        timestamp: '2025-10-07T00:00:00Z',
        category: 'delta-volume'
      },
      {
        id: '5',
        token: 'ETH',
        pair: 'ETH/USDT',
        alertType: 'Fast Move Alert',
        timeframe: '5M',
        description: 'Rapid price movement detected with significant volume increase.',
        price: '$3,825.50',
        timestamp: '2025-11-08T14:30:00Z',
        category: 'volatility'
      }
    ];

    // Filter by category if specified
    const filteredData = filter === 'all'
      ? mockAlerts
      : mockAlerts.filter((alert: { category: string }) => alert.category === filter);

    return NextResponse.json({
      success: true,
      filter,
      data: filteredData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching oracle alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

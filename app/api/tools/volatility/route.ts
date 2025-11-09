import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for Volatility Analysis Tool
 *
 * Integrates with Discord bot to fetch volatility alerts
 * Shows bullish (fast upward moves) or bearish (fast downward moves) alerts
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'bullish';

    // TODO: Replace with actual Discord bot webhook/API call
    // Mock data for development
    const mockBullish = [
      {
        token: 'RESOLV/USDT',
        pair: 'RESOLV/USDT',
        alertType: 'Fast Move Alert',
        price: '$0.0916',
        change5m: '+3.1053%',
        ticks5m: '382,695',
        volumeIncrease: '+165.20%',
        volume15m: '600,491$',
        timestamp: 'Today at 6:31 PM'
      },
      {
        token: 'BTC/USDT',
        pair: 'BTC/USDT',
        alertType: 'Big Move Alert',
        price: '$98,456',
        change5m: '+2.45%',
        ticks5m: '1,245,000',
        volumeIncrease: '+185.50%',
        volume15m: '$2.8B',
        timestamp: 'Today at 6:28 PM'
      }
    ];

    const mockBearish = [
      {
        token: 'FIL/USDT',
        pair: 'FIL/USDT',
        alertType: 'Big Move Alert',
        price: '$3.29',
        change5m: '-5.2222%',
        ticks5m: '1,364,250',
        volume15m: '3,315,839$',
        timestamp: 'Today at 8:33 AM'
      },
      {
        token: 'MMT/USDT',
        pair: 'MMT/USDT',
        alertType: 'Fast Move Alert',
        price: '$0.5898',
        change5m: '-3.1368%',
        ticks5m: '1,220,400',
        volume15m: '2,484,781$',
        timestamp: 'Today at 8:34 AM'
      }
    ];

    const mockData = type === 'bullish' ? mockBullish : mockBearish;

    return NextResponse.json({
      success: true,
      type,
      data: mockData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching volatility data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

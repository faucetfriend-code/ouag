import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for Funding Rates Tool
 *
 * Integrates with Discord bot to fetch perpetual futures funding rates
 * Shows positive (longs pay shorts) or negative (shorts pay longs) rates
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'positive';

    // TODO: Replace with actual Discord bot webhook/API call
    // Mock data for development
    const mockPositive = [
      { token: 'BTC/USDT', exchange: 'Binance', rate: '0.0100%', nextFunding: '4:00 PM', predicted: '0.0098%' },
      { token: 'ETH/USDT', exchange: 'Binance', rate: '0.0085%', nextFunding: '4:00 PM', predicted: '0.0082%' },
      { token: 'SOL/USDT', exchange: 'Bybit', rate: '0.0120%', nextFunding: '4:00 PM', predicted: '0.0115%' },
      { token: 'BNB/USDT', exchange: 'Binance', rate: '0.0075%', nextFunding: '4:00 PM', predicted: '0.0073%' },
      { token: 'XRP/USDT', exchange: 'OKX', rate: '0.0095%', nextFunding: '4:00 PM', predicted: '0.0091%' },
      { token: 'ADA/USDT', exchange: 'Binance', rate: '0.0060%', nextFunding: '4:00 PM', predicted: '0.0058%' },
    ];

    const mockNegative = [
      { token: 'DOGE/USDT', exchange: 'Binance', rate: '-0.0082%', nextFunding: '4:00 PM', predicted: '-0.0079%' },
      { token: 'SHIB/USDT', exchange: 'Bybit', rate: '-0.0095%', nextFunding: '4:00 PM', predicted: '-0.0092%' },
      { token: 'AVAX/USDT', exchange: 'OKX', rate: '-0.0068%', nextFunding: '4:00 PM', predicted: '-0.0065%' },
      { token: 'MATIC/USDT', exchange: 'Binance', rate: '-0.0072%', nextFunding: '4:00 PM', predicted: '-0.0070%' },
      { token: 'DOT/USDT', exchange: 'Bybit', rate: '-0.0055%', nextFunding: '4:00 PM', predicted: '-0.0053%' },
      { token: 'UNI/USDT', exchange: 'Binance', rate: '-0.0061%', nextFunding: '4:00 PM', predicted: '-0.0059%' },
    ];

    const mockData = type === 'positive' ? mockPositive : mockNegative;

    return NextResponse.json({
      success: true,
      type,
      data: mockData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching funding rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

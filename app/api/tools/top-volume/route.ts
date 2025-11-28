import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for Top Volume Tool
 *
 * Integrates with Discord bot to fetch top volume inflows/outflows data
 * Supports timeframe selection: 5m, 15m, 1h, 4h, 1d
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '5m';
    const flow = searchParams.get('flow') || 'inflows';

    // TODO: Replace with actual Discord bot webhook/API call
    // Mock data for development
    const mockInflows = [
      { token: 'BTC', price: '$98,245', volume: '$2.4B' },
      { token: 'ETH', price: '$3,825', volume: '$1.8B' },
      { token: 'SOL', price: '$245.30', volume: '$890M' },
      { token: 'BNB', price: '$645.20', volume: '$520M' },
      { token: 'XRP', price: '$2.15', volume: '$450M' },
      { token: 'ADA', price: '$1.02', volume: '$380M' },
      { token: 'AVAX', price: '$42.50', volume: '$340M' },
      { token: 'DOT', price: '$8.95', volume: '$290M' },
      { token: 'MATIC', price: '$0.92', volume: '$240M' },
      { token: 'LINK', price: '$22.40', volume: '$210M' },
    ];

    const mockOutflows = [
      { token: 'SHIB', price: '$0.000024', volume: '$-420M' },
      { token: 'DOGE', price: '$0.185', volume: '$-380M' },
      { token: 'TRX', price: '$0.245', volume: '$-290M' },
      { token: 'UNI', price: '$12.85', volume: '$-250M' },
      { token: 'ATOM', price: '$11.40', volume: '$-220M' },
      { token: 'LTC', price: '$145.30', volume: '$-190M' },
      { token: 'ETC', price: '$34.20', volume: '$-170M' },
      { token: 'FTM', price: '$0.68', volume: '$-150M' },
      { token: 'ALGO', price: '$0.42', volume: '$-130M' },
      { token: 'VET', price: '$0.052', volume: '$-110M' },
    ];

    const mockData = flow === 'inflows' ? mockInflows : mockOutflows;

    return NextResponse.json({
      success: true,
      timeframe,
      flow,
      data: mockData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching top volume data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

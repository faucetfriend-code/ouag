import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for Top Gainers & Losers Tool
 *
 * Integrates with Discord bot to fetch cryptocurrency gainers/losers data
 * Supports timeframe selection: 5m, 15m, 1h, 4h, 1d
 *
 * TODO: Replace mock data with actual Discord bot webhook integration
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '5m';
    const type = searchParams.get('type') || 'gainers';

    // TODO: Replace with actual Discord bot webhook/API call
    // const discordWebhookUrl = process.env.DISCORD_TOOLS_WEBHOOK_URL;
    // const response = await fetch(discordWebhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     tool: 'gainers-losers',
    //     timeframe,
    //     type
    //   })
    // });

    // Mock data for development
    const mockData = type === 'gainers' ? [
      { token: 'ATA', price: '$6.801', change: '2.96%' },
      { token: 'PYR', price: '$1.063', change: '2.95%' },
      { token: 'SAPIEN', price: '$0.2301', change: '1.56%' },
      { token: 'MYX', price: '$2.577', change: '1.24%' },
      { token: 'FLUX', price: '$0.2282', change: '1.01%' },
      { token: 'HIGH', price: '$0.3330', change: '0.97%' },
      { token: 'KAS', price: '$0.0521', change: '0.97%' },
      { token: 'NEAR', price: '$2.884', change: '0.91%' },
      { token: 'RESOLV', price: '$0.0887', change: '0.78%' },
      { token: 'WCT', price: '$0.1290', change: '0.78%' },
    ] : [
      { token: 'XNO', price: '$1.175', change: '-3.36%' },
      { token: 'C98', price: '$0.0380', change: '-1.89%' },
      { token: '10000QUBTC', price: '$0.009866', change: '-1.70%' },
      { token: 'TRUTH', price: '$0.0381', change: '-1.51%' },
      { token: 'ALICE', price: '$0.3224', change: '-1.07%' },
      { token: 'ICP', price: '$9.651', change: '-1.04%' },
      { token: 'SYRUP', price: '$0.4530', change: '-0.95%' },
      { token: 'ZEN', price: '$14.763', change: '-0.73%' },
      { token: '10000ELON', price: '$0.000628', change: '-0.71%' },
      { token: 'HOOK', price: '$0.0644', change: '-0.71%' },
    ];

    return NextResponse.json({
      success: true,
      timeframe,
      type,
      data: mockData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching gainers/losers data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

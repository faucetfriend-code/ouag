import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * API Route for Watchlist Tool
 *
 * User's personal cryptocurrency watchlist
 * Supports GET (fetch), POST (add), DELETE (remove)
 */

// GET - Fetch user's watchlist
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch from database
    // const watchlist = await prisma.watchlist.findMany({
    //   where: { userId: session.user.id }
    // });

    // Mock data for development
    const mockWatchlist = [
      {
        token: 'BTC',
        pair: 'BTC/USDT',
        price: '$98,245.50',
        change24h: '+2.45%',
        volume: '$2.4B',
        alerts: 2
      },
      {
        token: 'ETH',
        pair: 'ETH/USDT',
        price: '$3,825.30',
        change24h: '+1.85%',
        volume: '$1.8B',
        alerts: 0
      },
      {
        token: 'SOL',
        pair: 'SOL/USDT',
        price: '$245.75',
        change24h: '-0.92%',
        volume: '$890M',
        alerts: 1
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockWatchlist,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

// POST - Add token to watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // TODO: Add to database
    // await prisma.watchlist.create({
    //   data: {
    //     userId: session.user.id,
    //     token: token.toUpperCase()
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: `${token} added to watchlist`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add token' },
      { status: 500 }
    );
  }
}

// DELETE - Remove token from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // TODO: Remove from database
    // await prisma.watchlist.deleteMany({
    //   where: {
    //     userId: session.user.id,
    //     token: token.toUpperCase()
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: `${token} removed from watchlist`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove token' },
      { status: 500 }
    );
  }
}

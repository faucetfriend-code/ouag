import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Position {
  id: string;
  token: string;
  side: 'long' | 'short';
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  size: number;
  pnl: number;
  pnlPercentage: number;
  liquidationPrice: number;
  createdAt: string;
  updatedAt: string;
}

// Mock positions data - in production this would come from database
const mockPositions: Position[] = [
  {
    id: 'pos_1',
    token: 'BTC',
    side: 'long',
    leverage: 5,
    entryPrice: 58000,
    currentPrice: 58750,
    size: 0.1,
    pnl: 75,
    pnlPercentage: 1.29,
    liquidationPrice: 46400,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pos_2',
    token: 'ETH',
    side: 'short',
    leverage: 3,
    entryPrice: 2000,
    currentPrice: 1950,
    size: 1.0,
    pnl: 150,
    pnlPercentage: 2.5,
    liquidationPrice: 2600,
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch positions from database based on user ID
    return NextResponse.json(mockPositions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const positionData = await request.json();

    // TODO: Validate position data and create in database
    // Basic validation
    const { token, side, leverage, entryPrice, size } = positionData;

    if (!token || !side || !leverage || !entryPrice || !size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['long', 'short'].includes(side)) {
      return NextResponse.json({ error: 'Invalid side' }, { status: 400 });
    }

    if (leverage < 1 || leverage > 100) {
      return NextResponse.json({ error: 'Invalid leverage' }, { status: 400 });
    }

    // Create mock position
    const newPosition: Position = {
      id: `pos_${Date.now()}`,
      token,
      side,
      leverage,
      entryPrice,
      currentPrice: entryPrice, // Assume no change initially
      size,
      pnl: 0,
      pnlPercentage: 0,
      liquidationPrice: side === 'long'
        ? entryPrice * (1 - 1/leverage)
        : entryPrice * (1 + 1/leverage),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      message: 'Position created successfully',
      position: newPosition
    });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
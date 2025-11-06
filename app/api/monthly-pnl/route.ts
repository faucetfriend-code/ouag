import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface MonthlyPnLData {
  id: string;
  monthYear: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  totalVolume: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  createdAt: string;
  updatedAt: string;
}

// Mock monthly P&L data - in production this would come from database
const mockMonthlyPnL: MonthlyPnLData[] = [
  {
    id: 'mpl_1',
    monthYear: '2024-11',
    totalTrades: 24,
    winningTrades: 16,
    losingTrades: 8,
    totalPnL: 1250.75,
    totalVolume: 50000,
    winRate: 66.67,
    averageWin: 156.34,
    averageLoss: -93.75,
    largestWin: 450.00,
    largestLoss: -280.50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mpl_2',
    monthYear: '2024-10',
    totalTrades: 31,
    winningTrades: 19,
    losingTrades: 12,
    totalPnL: 890.25,
    totalVolume: 62000,
    winRate: 61.29,
    averageWin: 126.85,
    averageLoss: -78.45,
    largestWin: 320.00,
    largestLoss: -195.75,
    createdAt: new Date(Date.now() - 2592000000).toISOString(), // ~30 days ago
    updatedAt: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: 'mpl_3',
    monthYear: '2024-09',
    totalTrades: 28,
    winningTrades: 17,
    losingTrades: 11,
    totalPnL: -234.50,
    totalVolume: 48000,
    winRate: 60.71,
    averageWin: 98.75,
    averageLoss: -121.32,
    largestWin: 275.00,
    largestLoss: -345.25,
    createdAt: new Date(Date.now() - 5184000000).toISOString(), // ~60 days ago
    updatedAt: new Date(Date.now() - 5184000000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');

    // TODO: Fetch monthly P&L data from database based on user ID
    // For now, return mock data limited to the requested amount
    const data = mockMonthlyPnL.slice(0, limit);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching monthly P&L:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
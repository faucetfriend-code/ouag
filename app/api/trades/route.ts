/**
 * Trades API Endpoint
 *
 * Handles CRUD operations for user trades and positions
 * Supports both spot and leveraged trading
 */

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to update monthly P&L
async function updateMonthlyPnL(userId: string, monthYear: string) {
  // Get all closed trades for this month
  const trades = await prisma.trade.findMany({
    where: {
      userId,
      monthYear,
      realizedPnL: { not: null },
    },
  });

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t: { realizedPnL: number | null }) => (t.realizedPnL || 0) > 0).length;
  const losingTrades = trades.filter((t: { realizedPnL: number | null }) => (t.realizedPnL || 0) < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalPnL = trades.reduce((sum: number, t: { realizedPnL: number | null }) => sum + (t.realizedPnL || 0), 0);
  const totalVolume = trades.reduce((sum: number, t: { totalValue: number }) => sum + t.totalValue, 0);
  const totalFees = trades.reduce((sum: number, t: { fee: number }) => sum + t.fee, 0);

  const winningPnLs = trades.filter((t: { realizedPnL: number | null }) => (t.realizedPnL || 0) > 0).map((t: { realizedPnL: number | null }) => t.realizedPnL || 0);
  const losingPnLs = trades.filter((t: { realizedPnL: number | null }) => (t.realizedPnL || 0) < 0).map((t: { realizedPnL: number | null }) => t.realizedPnL || 0);

  const avgWin = winningPnLs.length > 0 ? winningPnLs.reduce((a: number, b: number) => a + b, 0) / winningPnLs.length : null;
  const avgLoss = losingPnLs.length > 0 ? losingPnLs.reduce((a: number, b: number) => a + b, 0) / losingPnLs.length : null;
  const largestWin = winningPnLs.length > 0 ? Math.max(...winningPnLs) : 0;
  const largestLoss = losingPnLs.length > 0 ? Math.min(...losingPnLs) : 0;

  // Calculate Sharpe ratio (simplified version)
  const returns = trades.map((t: { realizedPnL: number | null; totalValue: number }) => (t.realizedPnL || 0) / t.totalValue);
  const avgReturn = returns.length > 0 ? returns.reduce((a: number, b: number) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 0 ?
    returns.reduce((sum: number, ret: number) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : null;

  // Calculate max drawdown (simplified)
  let maxDrawdown = 0;
  let peak = 0;
  let currentDrawdown = 0;

  for (const trade of trades) {
    const cumulativePnL = trades.slice(0, trades.indexOf(trade) + 1)
      .reduce((sum: number, t: { realizedPnL: number | null }) => sum + (t.realizedPnL || 0), 0);

    if (cumulativePnL > peak) {
      peak = cumulativePnL;
      currentDrawdown = 0;
    } else {
      currentDrawdown = peak - cumulativePnL;
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    }
  }

  await prisma.monthlyPnL.upsert({
    where: {
      userId_monthYear: {
        userId,
        monthYear,
      },
    },
    update: {
      totalTrades,
      winningTrades,
      losingTrades,
      totalPnL,
      totalVolume,
      totalFees,
      winRate,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      sharpeRatio,
      maxDrawdown,
    },
    create: {
      userId,
      monthYear,
      totalTrades,
      winningTrades,
      losingTrades,
      totalPnL,
      totalVolume,
      totalFees,
      winRate,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      sharpeRatio,
      maxDrawdown,
    },
  });
}

export interface TradeData {
  token: string;
  side: 'buy' | 'sell' | 'long' | 'short';
  amount: number;
  price: number;
  leverage?: number;
  margin?: number;
  liquidationPrice?: number;
  positionType?: 'spot' | 'margin' | 'futures' | 'perpetual';
  fee?: number;
  feeCurrency?: string;
  exchange?: string;
  notes?: string;
  executedAt: string;
}

/**
 * GET /api/trades
 * Fetch user's trades with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const side = searchParams.get('side');
    const positionType = searchParams.get('positionType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Prisma.TradeWhereInput = { userId: session.user.id };

    if (token) where.token = token;
    if (side) where.side = side;
    if (positionType) where.positionType = positionType;

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { executedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Calculate performance metrics
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t: { realizedPnL: number | null }) => (t.realizedPnL || 0) > 0).length;
    const losingTrades = trades.filter((t: { realizedPnL: number | null }) => (t.realizedPnL || 0) < 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const totalPnL = trades.reduce((sum: number, t: { realizedPnL: number | null }) => sum + (t.realizedPnL || 0), 0);
    const totalVolume = trades.reduce((sum: number, t: { totalValue: number }) => sum + t.totalValue, 0);

    return NextResponse.json({
      trades,
      summary: {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate: Math.round(winRate * 100) / 100,
        totalPnL,
        totalVolume,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

/**
 * POST /api/trades
 * Create a new trade entry
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tradeData: TradeData = await request.json();

    // Validate required fields
    if (!tradeData.token || !tradeData.side || !tradeData.amount || !tradeData.price || !tradeData.executedAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate total value
    const totalValue = tradeData.amount * tradeData.price;

    // Generate month-year string for tracking
    const executedDate = new Date(tradeData.executedAt);
    const monthYear = `${executedDate.getFullYear()}-${String(executedDate.getMonth() + 1).padStart(2, '0')}`;

    // Calculate liquidation price for leveraged positions
    let liquidationPrice = null;
    if (tradeData.leverage && tradeData.leverage > 1) {
      const maintenanceMargin = 0.005; // 0.5% maintenance margin
      if (tradeData.side === 'long') {
        liquidationPrice = tradeData.price * (1 - (1 / tradeData.leverage) + maintenanceMargin);
      } else if (tradeData.side === 'short') {
        liquidationPrice = tradeData.price * (1 + (1 / tradeData.leverage) - maintenanceMargin);
      }
    }

    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        token: tradeData.token,
        side: tradeData.side,
        amount: tradeData.amount,
        price: tradeData.price,
        totalValue,
        leverage: tradeData.leverage,
        margin: tradeData.margin,
        liquidationPrice,
        positionType: tradeData.positionType || 'spot',
        fee: tradeData.fee || 0,
        feeCurrency: tradeData.feeCurrency || 'USD',
        exchange: tradeData.exchange,
        notes: tradeData.notes,
        executedAt: new Date(tradeData.executedAt),
        monthYear,
      },
    });

    // Update monthly P&L after creating trade
    await updateMonthlyPnL(session.user.id, monthYear);

    // If this is a leveraged position, create an open position record
    if (tradeData.leverage && tradeData.leverage > 1 && tradeData.margin && liquidationPrice !== null) {
      await prisma.openPosition.create({
        data: {
          userId: session.user.id,
          tradeId: trade.id,
          token: tradeData.token,
          side: tradeData.side,
          amount: tradeData.amount,
          entryPrice: tradeData.price,
          leverage: tradeData.leverage,
          margin: tradeData.margin,
          liquidationPrice,
          currentPrice: tradeData.price,
          exchange: tradeData.exchange,
        },
      });
    }

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 });
  }
}

/**
 * PUT /api/trades/[tradeId]
 * Update an existing trade (for closing positions)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const tradeId = url.pathname.split('/').pop();

    if (!tradeId) {
      return NextResponse.json({ error: 'Trade ID required' }, { status: 400 });
    }

    const updateData = await request.json();

    const trade = await prisma.trade.update({
      where: {
        id: tradeId,
        userId: session.user.id,
      },
      data: {
        closedAt: updateData.closedAt ? new Date(updateData.closedAt) : null,
        exitPrice: updateData.exitPrice,
        exitValue: updateData.exitValue,
        realizedPnL: updateData.realizedPnL,
        notes: updateData.notes,
      },
    });

    // If closing a leveraged position, update the open position
    if (updateData.closedAt) {
      await prisma.openPosition.updateMany({
        where: {
          tradeId,
          userId: session.user.id,
        },
        data: {
          status: 'closed',
        },
      });

      // Update monthly P&L after closing trade
      await updateMonthlyPnL(session.user.id, trade.monthYear);
    }

    return NextResponse.json({ trade }, { status: 200 });
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}

/**
 * DELETE /api/trades/[tradeId]
 * Delete a trade entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const tradeId = url.pathname.split('/').pop();

    if (!tradeId) {
      return NextResponse.json({ error: 'Trade ID required' }, { status: 400 });
    }

    // Delete associated open position first
    await prisma.openPosition.deleteMany({
      where: {
        tradeId,
        userId: session.user.id,
      },
    });

    // Delete the trade
    await prisma.trade.delete({
      where: {
        id: tradeId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting trade:', error);
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
  }
}
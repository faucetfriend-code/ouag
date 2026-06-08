import { NextResponse } from 'next/server';
import { botGet, BotAnalystStat } from '@/lib/botClient';

/**
 * API Route for Unity Desk Performance
 *
 * The live version of the monthly recap graphics: the Unity desk's analyst
 * leaderboard (win/loss, realized PnL) plus the desk's open positions — sourced
 * from the Discord Signal Bot. This is DESK-WIDE data (the signal-following
 * book), distinct from a member's personal portfolio under /api/positions.
 *
 * NOTE: Unity rule — results are presented in R:R, never dollar amounts. The
 * bot currently tracks realized_pnl in account terms; surface win-rate, R, and
 * counts in the UI and avoid rendering raw dollar PnL to members.
 */

interface BotPosition {
  symbol: string;
  side: string;
  entry: number;
  analyst: string;
  last_price: number;
  unrealized_pnl: number;
  tps_hit: number;
}

export async function GET() {
  try {
    const [statsRes, posRes] = await Promise.all([
      botGet<BotAnalystStat[]>('analyst-stats'),
      botGet<BotPosition[]>('positions'),
    ]);

    if (!statsRes && !posRes) {
      // Bot not configured/reachable — return empty, success:false flagged via source.
      return NextResponse.json({
        success: true,
        source: 'unavailable',
        leaderboard: [],
        openPositions: [],
        timestamp: new Date().toISOString(),
      });
    }

    const leaderboard = (statsRes?.data || []).map((a) => ({
      analyst: a.analyst,
      wins: a.wins,
      losses: a.losses,
      total: a.total,
      winRate: a.win_rate,
      leverage: a.leverage,
      // realized_pnl intentionally NOT surfaced as dollars to members (RR rule)
    }));

    const openPositions = (posRes?.data || []).map((p) => ({
      symbol: p.symbol,
      side: p.side,
      analyst: p.analyst,
      entry: p.entry,
      lastPrice: p.last_price,
      targetsHit: p.tps_hit,
    }));

    return NextResponse.json({
      success: true,
      source: 'bot',
      leaderboard,
      openPositions,
      timestamp: statsRes?.timestamp || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching desk performance:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch desk performance' }, { status: 500 });
  }
}

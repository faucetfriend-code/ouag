/**
 * Portfolio Holdings API Endpoint
 *
 * Handles individual portfolio holding operations (CRUD)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface HoldingData {
  token: string;
  amount: number;
  avgPrice: number;
}

/**
 * POST /api/portfolio/holdings
 * Add a new holding to user's portfolio
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, amount, avgPrice }: HoldingData = body;

    // Validate input
    if (!token || typeof amount !== 'number' || typeof avgPrice !== 'number') {
      return NextResponse.json({
        error: 'Token, amount, and avgPrice are required and must be valid'
      }, { status: 400 });
    }

    if (amount <= 0 || avgPrice <= 0) {
      return NextResponse.json({
        error: 'Amount and average price must be positive numbers'
      }, { status: 400 });
    }

    // Get or create portfolio
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id }
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId: session.user.id }
      });
    }

    // Check if holding already exists
    const existingHolding = await prisma.portfolioHolding.findUnique({
      where: {
        portfolioId_token: {
          portfolioId: portfolio.id,
          token: token.toUpperCase()
        }
      }
    });

    if (existingHolding) {
      return NextResponse.json({
        error: `Holding for ${token.toUpperCase()} already exists. Use PUT to update.`
      }, { status: 409 });
    }

    // Create new holding
    const holding = await prisma.portfolioHolding.create({
      data: {
        portfolioId: portfolio.id,
        token: token.toUpperCase(),
        amount,
        avgPrice
      }
    });

    return NextResponse.json({
      holding,
      message: 'Holding added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding portfolio holding:', error);
    return NextResponse.json({ error: 'Failed to add holding' }, { status: 500 });
  }
}

/**
 * PUT /api/portfolio/holdings/[token]
 * Update an existing holding
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const token = url.pathname.split('/').pop()?.toUpperCase();

    if (!token) {
      return NextResponse.json({ error: 'Token parameter required' }, { status: 400 });
    }

    const body = await request.json();
    const { amount, avgPrice }: Partial<HoldingData> = body;

    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id }
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Update holding
    const holding = await prisma.portfolioHolding.updateMany({
      where: {
        portfolioId: portfolio.id,
        token: token
      },
      data: {
        ...(amount !== undefined && { amount }),
        ...(avgPrice !== undefined && { avgPrice }),
        updatedAt: new Date()
      }
    });

    if (holding.count === 0) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    // Get updated holding
    const updatedHolding = await prisma.portfolioHolding.findFirst({
      where: {
        portfolioId: portfolio.id,
        token: token
      }
    });

    return NextResponse.json({
      holding: updatedHolding,
      message: 'Holding updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating portfolio holding:', error);
    return NextResponse.json({ error: 'Failed to update holding' }, { status: 500 });
  }
}

/**
 * DELETE /api/portfolio/holdings/[token]
 * Remove a holding from portfolio
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const token = url.pathname.split('/').pop()?.toUpperCase();

    if (!token) {
      return NextResponse.json({ error: 'Token parameter required' }, { status: 400 });
    }

    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id }
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Delete holding
    const result = await prisma.portfolioHolding.deleteMany({
      where: {
        portfolioId: portfolio.id,
        token: token
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Holding removed successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting portfolio holding:', error);
    return NextResponse.json({ error: 'Failed to delete holding' }, { status: 500 });
  }
}
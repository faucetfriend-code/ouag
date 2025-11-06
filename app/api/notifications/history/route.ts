import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        sentAt: 'desc',
      },
      take: Math.min(limit, 100), // Max 100 per request
      skip: offset,
    });

    const totalCount = await prisma.notification.count({
      where,
    });

    return NextResponse.json({
      notifications,
      totalCount,
      hasMore: offset + notifications.length < totalCount,
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds, read } = await request.json();

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'notificationIds array is required' },
        { status: 400 }
      );
    }

    // Update notifications as read/unread
    const updateData: any = {};
    if (read !== undefined) {
      updateData.read = read;
      if (read) {
        updateData.readAt = new Date();
      } else {
        updateData.readAt = null;
      }
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: session.user.id, // Ensure users can only update their own notifications
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
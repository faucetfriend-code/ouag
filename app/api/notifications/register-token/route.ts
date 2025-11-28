import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, platform } = await request.json();

    if (!token || !platform) {
      return NextResponse.json(
        { error: 'Token and platform are required' },
        { status: 400 }
      );
    }

    // Check if token already exists for this user
    const existingToken = await prisma.notificationToken.findFirst({
      where: {
        token,
        userId: session.user.id,
      },
    });

    if (existingToken) {
      // Update the existing token
      await prisma.notificationToken.update({
        where: { id: existingToken.id },
        data: {
          platform,
          lastUsed: new Date(),
        },
      });
    } else {
      // Create new token
      await prisma.notificationToken.create({
        data: {
          token,
          platform,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registering notification token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
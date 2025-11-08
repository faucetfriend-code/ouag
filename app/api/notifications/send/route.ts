import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin (only once)
let firebaseAdminInitialized = false;
if (!firebaseAdminInitialized) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    firebaseAdminInitialized = true;
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

interface SendNotificationRequest {
  userIds?: string[];
  title: string;
  body: string;
  type: 'price_alert' | 'portfolio_update' | 'news' | 'system';
  priority?: 'low' | 'normal' | 'high';
  data?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds, title, body, type, priority = 'normal', data }: SendNotificationRequest = await request.json();

    if (!title || !body || !type) {
      return NextResponse.json(
        { error: 'Title, body, and type are required' },
        { status: 400 }
      );
    }

    // Determine target users
    let targetUserIds: string[] = [];
    if (userIds && userIds.length > 0) {
      targetUserIds = userIds;
    } else {
      // Send to all users with push notifications enabled
      const usersWithNotifications = await prisma.userPreferences.findMany({
        where: {
          pushNotifications: true,
        },
        select: {
          userId: true,
        },
      });
      targetUserIds = usersWithNotifications.map((pref: { userId: string }) => pref.userId);
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({ message: 'No users to notify' });
    }

    // Get notification tokens for target users
    const notificationTokens = await prisma.notificationToken.findMany({
      where: {
        userId: {
          in: targetUserIds,
        },
      },
    });

    if (notificationTokens.length === 0) {
      return NextResponse.json({ message: 'No notification tokens found' });
    }

    // Group tokens by platform for batch sending
    const webTokens = notificationTokens.filter((t: { platform: string }) => t.platform === 'web').map((t: { token: string }) => t.token);
    const iosTokens = notificationTokens.filter((t: { platform: string }) => t.platform === 'ios').map((t: { token: string }) => t.token);
    const androidTokens = notificationTokens.filter((t: { platform: string }) => t.platform === 'android').map((t: { token: string }) => t.token);

    // Prepare Firebase message
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        type,
        priority,
        ...data,
      },
      android: {
        priority: (priority === 'high' ? 'high' : 'normal') as 'high' | 'normal',
        notification: {
          channelId: 'unity-oracle-channel',
          priority: (priority === 'high' ? 'max' : priority === 'low' ? 'min' : 'default') as 'low' | 'high' | 'max' | 'min' | 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const results = [];

    // Send to web tokens
    if (webTokens.length > 0) {
      try {
        const webResult = await getMessaging().sendEachForMulticast({
          ...message,
          tokens: webTokens,
        });
        results.push({ platform: 'web', ...webResult });
      } catch (error: unknown) {
        console.error('Error sending web notifications:', error);
        results.push({ platform: 'web', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Send to iOS tokens
    if (iosTokens.length > 0) {
      try {
        const iosResult = await getMessaging().sendEachForMulticast({
          ...message,
          tokens: iosTokens,
        });
        results.push({ platform: 'ios', ...iosResult });
      } catch (error: unknown) {
        console.error('Error sending iOS notifications:', error);
        results.push({ platform: 'ios', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Send to Android tokens
    if (androidTokens.length > 0) {
      try {
        const androidResult = await getMessaging().sendEachForMulticast({
          ...message,
          tokens: androidTokens,
        });
        results.push({ platform: 'android', ...androidResult });
      } catch (error: unknown) {
        console.error('Error sending Android notifications:', error);
        results.push({ platform: 'android', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Store notification history
    const notifications = targetUserIds.map((userId: string) => ({
      userId,
      title,
      body,
      type,
      priority,
      data,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    return NextResponse.json({
      success: true,
      results,
      totalSent: results.reduce((sum: number, r: any) => sum + ('successCount' in r ? r.successCount : 0), 0),
      totalFailed: results.reduce((sum: number, r: any) => sum + ('failureCount' in r ? r.failureCount : 0), 0),
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
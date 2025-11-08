import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

interface SubscriptionData {
  plan: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch subscription data from Stripe/database
    // Mock data for now
    const mockSubscription: SubscriptionData = {
      plan: 'premium',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancelAtPeriodEnd: false,
    };

    return NextResponse.json({ subscription: mockSubscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, planId, paymentMethodId } = await request.json();

    if (action === 'subscribe' && planId) {
      // TODO: Create subscription in Stripe
      console.log(`Creating subscription for user ${session.user.id}: plan ${planId}, payment method ${paymentMethodId}`);
      return NextResponse.json({
        message: 'Subscription created successfully',
        subscription: {
          plan: planId,
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      });
    }

    if (action === 'cancel') {
      // TODO: Cancel subscription in Stripe
      console.log(`Cancelling subscription for user ${session.user.id}`);
      return NextResponse.json({
        message: 'Subscription cancelled successfully',
        cancelAtPeriodEnd: true
      });
    }

    if (action === 'reactivate') {
      // TODO: Reactivate subscription in Stripe
      console.log(`Reactivating subscription for user ${session.user.id}`);
      return NextResponse.json({
        message: 'Subscription reactivated successfully',
        cancelAtPeriodEnd: false
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
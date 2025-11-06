import { NextRequest, NextResponse } from 'next/server';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  description?: string;
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch plans from database or Stripe
    // Mock data for now
    const plans: SubscriptionPlan[] = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        description: 'Perfect for getting started with basic market insights',
        features: [
          'Basic market data',
          'Limited analyst insights',
          'Community access',
          'Email notifications',
          'Mobile app access'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 29,
        interval: 'month',
        description: 'Full access to premium features and real-time data',
        popular: true,
        features: [
          'All Free features',
          'Unlimited analyst insights',
          'Real-time price alerts',
          'Advanced charting tools',
          'Priority support',
          'API access',
          'Custom notifications'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 99,
        interval: 'month',
        description: 'Institutional-grade tools for serious traders',
        features: [
          'All Premium features',
          'Institutional-grade data',
          'Custom analytics',
          'White-label solutions',
          'Dedicated account manager',
          'Advanced API limits',
          'Custom integrations'
        ]
      }
    ];

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
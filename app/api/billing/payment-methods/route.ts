import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch payment methods from Stripe/database
    // Mock data for now
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: 'pm_1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      },
      {
        id: 'pm_2',
        type: 'card',
        last4: '8888',
        brand: 'mastercard',
        expiryMonth: 8,
        expiryYear: 2026,
        isDefault: false
      }
    ];

    return NextResponse.json({ paymentMethods: mockPaymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, paymentMethodId } = await request.json();

    if (action === 'set-default' && paymentMethodId) {
      // TODO: Update default payment method in Stripe/database
      console.log(`Setting default payment method for user ${session.user.id}: ${paymentMethodId}`);
      return NextResponse.json({ message: 'Default payment method updated successfully' });
    }

    if (action === 'remove' && paymentMethodId) {
      // TODO: Remove payment method from Stripe/database
      console.log(`Removing payment method for user ${session.user.id}: ${paymentMethodId}`);
      return NextResponse.json({ message: 'Payment method removed successfully' });
    }

    if (action === 'add') {
      // TODO: Add new payment method via Stripe Elements
      console.log(`Adding payment method for user ${session.user.id}`);
      return NextResponse.json({
        message: 'Payment method added successfully',
        paymentMethod: { id: 'pm_new', type: 'card', last4: '0000', brand: 'visa', expiryMonth: 1, expiryYear: 2027, isDefault: false }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing payment methods:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
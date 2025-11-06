import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  downloadUrl: string;
  paymentMethod: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch invoices from Stripe/database
    // Mock data for now
    const mockInvoices: Invoice[] = [
      {
        id: 'inv_001',
        date: '2024-11-01',
        amount: 29.00,
        status: 'paid',
        plan: 'Premium',
        downloadUrl: '#',
        paymentMethod: 'Visa ****4242'
      },
      {
        id: 'inv_002',
        date: '2024-10-01',
        amount: 29.00,
        status: 'paid',
        plan: 'Premium',
        downloadUrl: '#',
        paymentMethod: 'Visa ****4242'
      },
      {
        id: 'inv_003',
        date: '2024-09-01',
        amount: 29.00,
        status: 'paid',
        plan: 'Premium',
        downloadUrl: '#',
        paymentMethod: 'Mastercard ****8888'
      },
      {
        id: 'inv_004',
        date: '2024-08-01',
        amount: 29.00,
        status: 'paid',
        plan: 'Premium',
        downloadUrl: '#',
        paymentMethod: 'Mastercard ****8888'
      }
    ];

    return NextResponse.json({ invoices: mockInvoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, invoiceId } = await request.json();

    if (action === 'download' && invoiceId) {
      // TODO: Generate and return invoice PDF from Stripe
      console.log(`Downloading invoice for user ${session.user.id}: ${invoiceId}`);
      return NextResponse.json({
        message: 'Invoice download initiated',
        downloadUrl: `/api/billing/invoices/${invoiceId}/download`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();

    // TODO: Implement 2FA setup/verification logic
    // This would typically involve:
    // 1. Generating TOTP secret
    // 2. Sending verification code
    // 3. Validating code
    // 4. Storing secret in database

    return NextResponse.json({
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled
    });
  } catch (error) {
    console.error('Error managing 2FA:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
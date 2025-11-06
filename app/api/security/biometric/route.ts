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

    // TODO: Implement biometric authentication setup
    // This would typically involve:
    // 1. Storing biometric preference in database
    // 2. Setting up biometric credentials
    // 3. Managing biometric keys

    return NextResponse.json({
      message: `Biometric authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled
    });
  } catch (error) {
    console.error('Error managing biometric auth:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
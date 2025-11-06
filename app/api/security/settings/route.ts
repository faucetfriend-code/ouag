import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

// Mock security settings - in production this would come from database
const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  biometricEnabled: false,
  sessionTimeout: 30,
  loginNotifications: true,
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch from database based on user ID
    return NextResponse.json(mockSecuritySettings);
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // TODO: Validate and save to database
    // For now, just return success
    return NextResponse.json({
      message: 'Security settings updated successfully',
      settings: body
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
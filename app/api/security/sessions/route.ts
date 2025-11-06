import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

// Mock active sessions - in production this would come from database
const mockSessions: Session[] = [
  {
    id: 'session_1',
    device: 'Chrome on Windows',
    location: 'New York, US',
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: 'session_2',
    device: 'Safari on iPhone',
    location: 'London, UK',
    lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isCurrent: false,
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch from database based on user ID
    return NextResponse.json(mockSessions);
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'terminate-others') {
      // TODO: Terminate all other sessions in database
      return NextResponse.json({
        message: 'All other sessions terminated successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
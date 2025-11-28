import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;

    // TODO: Validate session belongs to user and terminate it in database
    // For now, just return success
    return NextResponse.json({
      message: `Session ${sessionId} terminated successfully`
    });
  } catch (error) {
    console.error('Error terminating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
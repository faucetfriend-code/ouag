import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json(session.user);
  } catch (error) {
    console.error('Auth check failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
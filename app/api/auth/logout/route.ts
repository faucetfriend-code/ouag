import { auth, signOut } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout failed:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
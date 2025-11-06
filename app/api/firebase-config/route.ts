/**
 * Firebase Config API Endpoint
 *
 * Serves Firebase client configuration to the service worker
 * This is a public endpoint (no authentication required)
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Check if Firebase is configured
  const isConfigured = Object.values(firebaseConfig).every(
    (value) => value && value !== 'your_' && !value.includes('your_')
  );

  if (!isConfigured) {
    return NextResponse.json(
      {
        error: 'Firebase not configured',
        message: 'Please add Firebase credentials to .env.local'
      },
      { status: 503 }
    );
  }

  return NextResponse.json(firebaseConfig, {
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}

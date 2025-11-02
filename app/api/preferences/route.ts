/**
 * User Preferences API Endpoint
 *
 * Handles saving and loading user preferences to/from Redis
 * Syncs with client-side localStorage for optimal performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadPreferencesFromRedis, savePreferencesToRedis } from '@/lib/serverUserPreferences';
import type { UserPreferences } from '@/lib/user-preferences-context';

/**
 * GET /api/preferences
 * Load user preferences from Redis
 */
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get userId from the session/JWT
    // For now, we'll use the test user ID
    const userId = 'test-doom'; // TODO: Get from authenticated session

    const preferences = await loadPreferencesFromRedis(userId);

    if (preferences) {
      return NextResponse.json(preferences, { status: 200 });
    } else {
      // Return 404 if no preferences found
      return NextResponse.json({ error: 'Preferences not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 });
  }
}

/**
 * POST /api/preferences
 * Save user preferences to Redis
 */
export async function POST(request: NextRequest) {
  try {
    const body: UserPreferences = await request.json();

    // Validate required fields
    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // In a real app, verify the userId matches the authenticated user
    // For now, we'll allow any userId for the test user
    const userId = 'test-doom'; // TODO: Get from authenticated session

    // Ensure the preference's userId matches the authenticated user
    body.userId = userId;

    await savePreferencesToRedis(body);

    return NextResponse.json({ success: true, preferences: body }, { status: 200 });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}

/**
 * DELETE /api/preferences
 * Delete user preferences from Redis
 */
export async function DELETE(request: NextRequest) {
  try {
    // In a real app, you'd get userId from the session/JWT
    const userId = 'test-doom'; // TODO: Get from authenticated session

    const { deletePreferencesFromRedis } = await import('@/lib/serverUserPreferences');
    await deletePreferencesFromRedis(userId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting preferences:', error);
    return NextResponse.json({ error: 'Failed to delete preferences' }, { status: 500 });
  }
}

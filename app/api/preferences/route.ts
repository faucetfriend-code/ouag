/**
 * User Preferences API Endpoint
 *
 * Handles saving and loading user preferences to/from database
 * Requires authentication via NextAuth session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { UserPreferences } from '@/lib/user-preferences-context';

/**
 * GET /api/preferences
 * Load user preferences from database
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    });

    if (preferences) {
      // Convert database format to frontend format
      const frontendPrefs: UserPreferences = {
        userId: preferences.userId,
        currency: preferences.currency,
        timezone: preferences.timezone,
        theme: preferences.theme,
        language: preferences.language,
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        smsNotifications: preferences.smsNotifications,
        priceAlerts: preferences.priceAlerts,
        analystUpdates: preferences.analystUpdates,
        marketNews: preferences.marketNews,
        weeklyDigest: preferences.weeklyDigest,
        riskTolerance: preferences.riskTolerance,
        defaultTimeframe: preferences.defaultTimeframe,
        favoriteTokens: preferences.favoriteTokens,
        profileVisibility: preferences.profileVisibility,
        dataSharing: preferences.dataSharing,
        analyticsTracking: preferences.analyticsTracking,
      };

      return NextResponse.json(frontendPrefs, { status: 200 });
    } else {
      // Return default preferences if none found
      const defaultPrefs: UserPreferences = {
        userId: session.user.id,
        currency: 'USD',
        timezone: 'UTC',
        theme: 'light',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        priceAlerts: true,
        analystUpdates: true,
        marketNews: true,
        weeklyDigest: true,
        riskTolerance: 'moderate',
        defaultTimeframe: '1D',
        favoriteTokens: [],
        profileVisibility: 'public',
        dataSharing: false,
        analyticsTracking: true,
      };

      return NextResponse.json(defaultPrefs, { status: 200 });
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 });
  }
}

/**
 * POST /api/preferences
 * Save user preferences to database
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Partial<UserPreferences> = await request.json();

    // Ensure userId matches authenticated user
    const preferencesData = {
      userId: session.user.id,
      currency: body.currency || 'USD',
      timezone: body.timezone || 'UTC',
      theme: body.theme || 'light',
      language: body.language || 'en',
      emailNotifications: body.emailNotifications ?? true,
      pushNotifications: body.pushNotifications ?? true,
      smsNotifications: body.smsNotifications ?? false,
      priceAlerts: body.priceAlerts ?? true,
      analystUpdates: body.analystUpdates ?? true,
      marketNews: body.marketNews ?? true,
      weeklyDigest: body.weeklyDigest ?? true,
      riskTolerance: body.riskTolerance || 'moderate',
      defaultTimeframe: body.defaultTimeframe || '1D',
      favoriteTokens: body.favoriteTokens || [],
      profileVisibility: body.profileVisibility || 'public',
      dataSharing: body.dataSharing ?? false,
      analyticsTracking: body.analyticsTracking ?? true,
    };

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: preferencesData,
      create: preferencesData,
    });

    return NextResponse.json({
      success: true,
      preferences: {
        ...preferences,
        favoriteTokens: preferences.favoriteTokens as string[],
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}

/**
 * DELETE /api/preferences
 * Reset user preferences to defaults
 */
export async function DELETE(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.userPreferences.delete({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting preferences:', error);
    return NextResponse.json({ error: 'Failed to delete preferences' }, { status: 500 });
  }
}

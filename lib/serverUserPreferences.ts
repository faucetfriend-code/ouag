/**
 * Server-Side User Preferences Manager
 *
 * Handles Redis operations for user preferences
 * Provides persistent storage across devices
 */

import 'server-only';
import { redisService } from './redis';
import type { UserPreferences } from './user-preferences-context';

/**
 * Redis key pattern for user preferences
 * Format: user:preferences:{userId}
 */
function getUserPreferencesKey(userId: string): string {
  return `user:preferences:${userId}`;
}

/**
 * Save user preferences to Redis
 */
export async function savePreferencesToRedis(preferences: UserPreferences): Promise<void> {
  try {
    const key = getUserPreferencesKey(preferences.userId);
    const data = {
      ...preferences,
      lastSync: new Date().toISOString(),
    };
    await redisService.set(key, JSON.stringify(data));
    console.log(`[Redis] Saved preferences for user ${preferences.userId}`);
  } catch (error) {
    console.error('Error saving preferences to Redis:', error);
    throw error;
  }
}

/**
 * Load user preferences from Redis
 */
export async function loadPreferencesFromRedis(userId: string): Promise<UserPreferences | null> {
  try {
    const key = getUserPreferencesKey(userId);
    const data = await redisService.get(key);

    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        lastSync: parsed.lastSync ? new Date(parsed.lastSync) : undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error loading preferences from Redis:', error);
    return null;
  }
}

/**
 * Delete user preferences from Redis
 */
export async function deletePreferencesFromRedis(userId: string): Promise<void> {
  try {
    const key = getUserPreferencesKey(userId);
    await redisService.del(key);
    console.log(`[Redis] Deleted preferences for user ${userId}`);
  } catch (error) {
    console.error('Error deleting preferences from Redis:', error);
    throw error;
  }
}

/**
 * Get all users who favorited a specific analyst
 */
export async function getUsersWhoFavorited(analystUsername: string): Promise<string[]> {
  try {
    // Scan all user preference keys
    const pattern = 'user:preferences:*';
    const keys = await redisService.keys(pattern);

    const usersWhoFavorited: string[] = [];

    for (const key of keys) {
      const data = await redisService.get(key);
      if (data) {
        const prefs: UserPreferences = JSON.parse(data);
        if (prefs.favoriteAnalysts.includes(analystUsername)) {
          usersWhoFavorited.push(prefs.userId);
        }
      }
    }

    return usersWhoFavorited;
  } catch (error) {
    console.error('Error getting users who favorited analyst:', error);
    return [];
  }
}

/**
 * Get follower count for an analyst
 */
export async function getAnalystFollowerCount(analystUsername: string): Promise<number> {
  try {
    const followers = await getUsersWhoFavorited(analystUsername);
    return followers.length;
  } catch (error) {
    console.error('Error getting analyst follower count:', error);
    return 0;
  }
}

/**
 * Get all favorite analysts for a user (quick lookup)
 */
export async function getUserFavorites(userId: string): Promise<string[]> {
  try {
    const prefs = await loadPreferencesFromRedis(userId);
    return prefs?.favoriteAnalysts || [];
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
}

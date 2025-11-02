/**
 * Client-Side User Preferences Manager
 *
 * Handles localStorage operations for user preferences
 * This provides fast local access before syncing with Redis
 */

import type { UserPreferences } from './user-preferences-context';

const STORAGE_PREFIX = 'user_prefs_';

/**
 * Save preferences to localStorage
 */
export function savePreferencesToLocal(preferences: UserPreferences): void {
  try {
    const key = `${STORAGE_PREFIX}${preferences.userId}`;
    localStorage.setItem(key, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to localStorage:', error);
  }
}

/**
 * Load preferences from localStorage
 */
export function loadPreferencesFromLocal(userId: string): UserPreferences | null {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading preferences from localStorage:', error);
  }
  return null;
}

/**
 * Clear preferences from localStorage
 */
export function clearPreferencesFromLocal(userId: string): void {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing preferences from localStorage:', error);
  }
}

/**
 * Check if analyst is favorited (quick localStorage check)
 */
export function isAnalystFavorited(userId: string, analystUsername: string): boolean {
  const prefs = loadPreferencesFromLocal(userId);
  return prefs?.favoriteAnalysts.includes(analystUsername) || false;
}

/**
 * Add analyst to favorites (localStorage only - use context for full sync)
 */
export function addFavoriteToLocal(userId: string, analystUsername: string): void {
  const prefs = loadPreferencesFromLocal(userId);
  if (prefs && !prefs.favoriteAnalysts.includes(analystUsername)) {
    prefs.favoriteAnalysts.push(analystUsername);
    savePreferencesToLocal(prefs);
  }
}

/**
 * Remove analyst from favorites (localStorage only - use context for full sync)
 */
export function removeFavoriteFromLocal(userId: string, analystUsername: string): void {
  const prefs = loadPreferencesFromLocal(userId);
  if (prefs) {
    prefs.favoriteAnalysts = prefs.favoriteAnalysts.filter(a => a !== analystUsername);
    savePreferencesToLocal(prefs);
  }
}

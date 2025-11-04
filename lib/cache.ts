/**
 * Client-Side Cache Utilities
 *
 * Provides localStorage-based caching with TTL (time-to-live) support.
 * Includes offline detection and cache management utilities.
 */

'use client';

import React from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time-to-live in milliseconds
}

const CACHE_PREFIX = 'unity_oracle_';

/**
 * Set an item in the cache with TTL
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttl - Time-to-live in milliseconds (default: 5 minutes)
 */
export function setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to set cache:', error);
    // localStorage might be full or unavailable
  }
}

/**
 * Get an item from the cache
 * @param key - Cache key
 * @returns Cached data or null if not found/expired
 */
export function getCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) {
      return null;
    }

    const cacheItem: CacheItem<T> = JSON.parse(item);
    const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;

    if (isExpired) {
      // Remove expired item
      removeCache(key);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
}

/**
 * Remove an item from the cache
 * @param key - Cache key
 */
export function removeCache(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.warn('Failed to remove cache:', error);
  }
}

/**
 * Clear all cached items
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Get cache statistics
 * @returns Object with cache size and count
 */
export function getCacheStats(): { count: number; sizeKB: number } {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

    let totalSize = 0;
    cacheKeys.forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    });

    return {
      count: cacheKeys.length,
      sizeKB: Math.round(totalSize / 1024),
    };
  } catch (error) {
    console.warn('Failed to get cache stats:', error);
    return { count: 0, sizeKB: 0 };
  }
}

/**
 * Check if the user is online
 * @returns true if online, false if offline
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') {
    return true; // SSR
  }
  return navigator.onLine;
}

/**
 * Hook to listen for online/offline status
 */
export function useOnlineStatus() {
  // Always call hooks first (before any conditional returns)
  const [online, setOnline] = React.useState(() =>
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    // Skip effect on SSR
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

/**
 * Cache with fallback pattern
 * Tries to get data from cache first, then fetches if not available
 * @param key - Cache key
 * @param fetchFn - Function to fetch fresh data
 * @param ttl - Time-to-live in milliseconds
 */
export async function getCacheOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try cache first
  const cached = getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  try {
    const data = await fetchFn();
    setCache(key, data, ttl);
    return data;
  } catch (error) {
    // If offline, try to return stale cache (even if expired)
    if (!isOnline()) {
      const staleCache = localStorage.getItem(CACHE_PREFIX + key);
      if (staleCache) {
        const cacheItem: CacheItem<T> = JSON.parse(staleCache);
        console.warn('Using stale cache due to offline status');
        return cacheItem.data;
      }
    }
    throw error;
  }
}

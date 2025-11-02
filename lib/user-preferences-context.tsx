'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-context';

// TypeScript interfaces for type safety
export interface TradingPreferences {
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  defaultTimeframe: '1h' | '4h' | '1d' | '1w';
}

export interface NotificationSettings {
  priceAlerts: boolean;
  analystInsights: boolean;
  pushEnabled: boolean;
}

export interface AnalysisPreferences {
  technicalAnalysis: boolean;
  fundamentalAnalysis: boolean;
}

export interface UserPreferences {
  userId: string;
  favoriteAnalysts: string[];
  tradingPreferences: TradingPreferences;
  notificationSettings: NotificationSettings;
  analysisPreferences: AnalysisPreferences;
  lastSync?: Date;
}

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  // Favorites
  favoriteAnalyst: (username: string) => Promise<void>;
  unfavoriteAnalyst: (username: string) => Promise<void>;
  isFavorite: (username: string) => boolean;
  // Trading Preferences
  updateTradingPreferences: (prefs: Partial<TradingPreferences>) => Promise<void>;
  // Notification Settings
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  // Analysis Preferences
  updateAnalysisPreferences: (prefs: Partial<AnalysisPreferences>) => Promise<void>;
  // Save all
  savePreferences: () => Promise<void>;
  // Refresh from server
  refreshPreferences: () => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Default preferences for new users
const getDefaultPreferences = (userId: string): UserPreferences => ({
  userId,
  favoriteAnalysts: [],
  tradingPreferences: {
    riskTolerance: 'Moderate',
    defaultTimeframe: '1d',
  },
  notificationSettings: {
    priceAlerts: false,
    analystInsights: false,
    pushEnabled: false,
  },
  analysisPreferences: {
    technicalAnalysis: true,
    fundamentalAnalysis: true,
  },
});

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncTimer, setSyncTimer] = useState<NodeJS.Timeout | null>(null);

  // Load preferences from localStorage and Redis
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      // Try localStorage first (fast)
      const localPrefs = localStorage.getItem(`user_prefs_${user.id}`);
      if (localPrefs) {
        const parsed = JSON.parse(localPrefs);
        setPreferences(parsed);
      } else {
        // No local preferences, use defaults
        setPreferences(getDefaultPreferences(user.id));
      }

      // Then sync with server in background
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const serverPrefs = await response.json();
        setPreferences(serverPrefs);
        // Update localStorage with server data
        localStorage.setItem(`user_prefs_${user.id}`, JSON.stringify(serverPrefs));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Use defaults on error
      if (user) {
        setPreferences(getDefaultPreferences(user.id));
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save preferences to localStorage immediately and schedule Redis sync
  const saveToLocalStorage = useCallback((prefs: UserPreferences) => {
    if (prefs.userId) {
      localStorage.setItem(`user_prefs_${prefs.userId}`, JSON.stringify(prefs));
    }
  }, []);

  // Debounced sync to server (don't spam the API)
  const scheduleSyncToServer = useCallback(() => {
    if (syncTimer) {
      clearTimeout(syncTimer);
    }

    const timer = setTimeout(async () => {
      if (preferences) {
        try {
          await fetch('/api/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences),
          });
          console.log('[UserPreferences] Synced to server');
        } catch (error) {
          console.error('Error syncing preferences to server:', error);
        }
      }
    }, 2000); // Wait 2 seconds after last change

    setSyncTimer(timer);
  }, [preferences, syncTimer]);

  // Load preferences on mount or user change
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (syncTimer) {
        clearTimeout(syncTimer);
      }
    };
  }, [syncTimer]);

  // Favorite an analyst
  const favoriteAnalyst = useCallback(async (username: string) => {
    if (!preferences) return;

    const newPrefs = {
      ...preferences,
      favoriteAnalysts: [...preferences.favoriteAnalysts, username],
    };
    setPreferences(newPrefs);
    saveToLocalStorage(newPrefs);
    scheduleSyncToServer();
  }, [preferences, saveToLocalStorage, scheduleSyncToServer]);

  // Unfavorite an analyst
  const unfavoriteAnalyst = useCallback(async (username: string) => {
    if (!preferences) return;

    const newPrefs = {
      ...preferences,
      favoriteAnalysts: preferences.favoriteAnalysts.filter(a => a !== username),
    };
    setPreferences(newPrefs);
    saveToLocalStorage(newPrefs);
    scheduleSyncToServer();
  }, [preferences, saveToLocalStorage, scheduleSyncToServer]);

  // Check if analyst is favorited
  const isFavorite = useCallback((username: string): boolean => {
    return preferences?.favoriteAnalysts.includes(username) || false;
  }, [preferences]);

  // Update trading preferences
  const updateTradingPreferences = useCallback(async (prefs: Partial<TradingPreferences>) => {
    if (!preferences) return;

    const newPrefs = {
      ...preferences,
      tradingPreferences: { ...preferences.tradingPreferences, ...prefs },
    };
    setPreferences(newPrefs);
    saveToLocalStorage(newPrefs);
    scheduleSyncToServer();
  }, [preferences, saveToLocalStorage, scheduleSyncToServer]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>) => {
    if (!preferences) return;

    const newPrefs = {
      ...preferences,
      notificationSettings: { ...preferences.notificationSettings, ...settings },
    };
    setPreferences(newPrefs);
    saveToLocalStorage(newPrefs);
    scheduleSyncToServer();
  }, [preferences, saveToLocalStorage, scheduleSyncToServer]);

  // Update analysis preferences
  const updateAnalysisPreferences = useCallback(async (prefs: Partial<AnalysisPreferences>) => {
    if (!preferences) return;

    const newPrefs = {
      ...preferences,
      analysisPreferences: { ...preferences.analysisPreferences, ...prefs },
    };
    setPreferences(newPrefs);
    saveToLocalStorage(newPrefs);
    scheduleSyncToServer();
  }, [preferences, saveToLocalStorage, scheduleSyncToServer]);

  // Manual save (force immediate sync)
  const savePreferences = useCallback(async () => {
    if (!preferences) return;

    try {
      saveToLocalStorage(preferences);
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      console.log('[UserPreferences] Saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }, [preferences, saveToLocalStorage]);

  // Refresh from server
  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        loading,
        favoriteAnalyst,
        unfavoriteAnalyst,
        isFavorite,
        updateTradingPreferences,
        updateNotificationSettings,
        updateAnalysisPreferences,
        savePreferences,
        refreshPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}

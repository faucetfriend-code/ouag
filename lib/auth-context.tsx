'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
  isServerMember: boolean;
  subscription?: {
    active: boolean;
    endDate?: Date;
    plan?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  canAccessPremium: () => boolean;
  grantTestAccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Test user for development
  const testUser: User = {
    id: 'test-doom',
    discordId: '123456789',
    username: 'Doom',
    discriminator: '0001',
    avatar: undefined,
    email: 'doom@test.com',
    isServerMember: true,
    subscription: {
      active: true,
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      plan: 'Test Access'
    }
  };

  const [user, setUser] = useState<User | null>(testUser);
  const [loading, setLoading] = useState(false);

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const login = () => {
    window.location.href = '/api/auth/discord';
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const canAccessPremium = () => {
    return user?.subscription?.active === true;
  };

  const grantTestAccess = () => {
    if (user) {
      setUser({
        ...user,
        isServerMember: true,
        subscription: {
          active: true,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          plan: 'Test Access'
        }
      });
    }
  };

  // Disabled refreshUser for test user
  // useEffect(() => {
  //   refreshUser().finally(() => setLoading(false));
  // }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, canAccessPremium, grantTestAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
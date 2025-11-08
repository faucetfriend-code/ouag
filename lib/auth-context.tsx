'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export interface User {
  id: string;
  discordId?: string;
  username?: string;
  discriminator?: string;
  avatar?: string;
  email?: string;
  name?: string;
  isServerMember?: boolean;
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
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const loading = status === 'loading';

  // Check for test user mode (enabled via environment variable or localStorage)
  useEffect(() => {
    const enableTestUser = process.env.NEXT_PUBLIC_ENABLE_TEST_USER === 'true' ||
                          (typeof window !== 'undefined' && localStorage.getItem('enable_test_user') === 'true');

    if (enableTestUser && !session) {
      // Set a test user for development/demo purposes
      setUser({
        id: 'test-user-123',
        discordId: 'test-discord-id',
        username: 'TestUser',
        discriminator: '0001',
        avatar: undefined,
        email: 'test@example.com',
        name: 'Test User',
        isServerMember: true,
        subscription: {
          active: true,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          plan: 'Premium (Test)'
        }
      });
    } else if (session?.user) {
      setUser({
        id: session.user.id,
        discordId: (session.user as any).discordId,
        username: (session.user as any).username,
        discriminator: (session.user as any).discriminator,
        avatar: (session.user as any).avatar,
        email: session.user.email,
        name: (session.user as any).name || (session.user as any).username,
        isServerMember: (session.user as any).isServerMember,
        subscription: (session.user as any).subscription,
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const refreshUser = async () => {
    // With NextAuth, the session automatically refreshes
    // This method is kept for compatibility
    return Promise.resolve();
  };

  const login = () => {
    signIn('discord');
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const canAccessPremium = () => {
    return user?.subscription?.active === true;
  };

  const grantTestAccess = () => {
    // For development/testing purposes
    if (user) {
      setUser({
        ...user,
        isServerMember: true,
        subscription: {
          active: true,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          plan: 'Test Access'
        }
      });
    }
  };

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
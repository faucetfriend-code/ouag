'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/auth-context';
import { UserPreferencesProvider } from '@/lib/user-preferences-context';
import { LoadingProvider } from '@/lib/loading-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LoadingProvider>
        <AuthProvider>
          <UserPreferencesProvider>
            {children}
          </UserPreferencesProvider>
        </AuthProvider>
      </LoadingProvider>
    </SessionProvider>
  );
}

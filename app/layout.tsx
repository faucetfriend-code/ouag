import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { UserPreferencesProvider } from '@/lib/user-preferences-context'
import { LoadingProvider } from '@/lib/loading-context'
import ErrorBoundary from '@/components/ErrorBoundary'
import GlobalLoadingSpinner from '@/components/GlobalLoadingSpinner'
import ToastProvider from '@/components/ToastProvider'
import OfflineIndicator from '@/components/OfflineIndicator'

export const metadata: Metadata = {
  title: 'Unity Oracle Aggregator',
  description: 'Crypto trading analysis aggregator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <LoadingProvider>
            <AuthProvider>
              <UserPreferencesProvider>
                {children}
                <GlobalLoadingSpinner />
                <ToastProvider />
                <OfflineIndicator />
              </UserPreferencesProvider>
            </AuthProvider>
          </LoadingProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
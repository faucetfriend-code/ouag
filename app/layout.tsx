import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import ErrorBoundary from '@/components/ErrorBoundary'
import GlobalLoadingSpinner from '@/components/GlobalLoadingSpinner'
import ToastProvider from '@/components/ToastProvider'
import OfflineIndicator from '@/components/OfflineIndicator'
import DevTools from '@/components/DevTools'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Unity Oracle Aggregator',
  description: 'Unify on-chain price feeds, track positions, monitor market anomalies, and follow analyst signals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient">
        <ErrorBoundary>
          <Providers>
            <Navigation />
            <main id="main-content">
              {children}
            </main>
            <GlobalLoadingSpinner />
            <ToastProvider />
            <OfflineIndicator />
            <DevTools />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
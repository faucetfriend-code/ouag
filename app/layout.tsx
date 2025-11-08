import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import { Providers } from '@/components/Providers'
import ErrorBoundary from '@/components/ErrorBoundary'
import GlobalLoadingSpinner from '@/components/GlobalLoadingSpinner'
import ToastProvider from '@/components/ToastProvider'
import OfflineIndicator from '@/components/OfflineIndicator'
import DevTools from '@/components/DevTools'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

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
          <Providers>
            <Navigation />
            <main id="main-content">
              {children}
            </main>
            <Footer />
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
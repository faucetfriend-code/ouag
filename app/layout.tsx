import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import { Providers } from '@/components/Providers'
import ErrorBoundary from '@/components/ErrorBoundary'
import GlobalLoadingSpinner from '@/components/GlobalLoadingSpinner'
import ToastProvider from '@/components/ToastProvider'
import OfflineIndicator from '@/components/OfflineIndicator'
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
            {children}
            <Footer />
            <GlobalLoadingSpinner />
            <ToastProvider />
            <OfflineIndicator />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
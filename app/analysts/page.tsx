/**
 * Analysts Overview Page
 *
 * Displays a grid of all supported tokens with key metrics and analyst counts.
 * Each token card links to a detailed summary page showing analyst sentiment.
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockTradingPosts, tokens } from '../../data/mockData';
import { organizeDataByToken } from '../../utils/dataOrganization';

// Mock price data for demonstration (would come from real API in production)
const mockPriceData: Record<string, { price: number; change1h: number; change24h: number }> = {
  BTC: { price: 58750, change1h: 0.85, change24h: 2.34 },
  ETH: { price: 1950, change1h: -0.23, change24h: 1.67 },
  ADA: { price: 0.42, change1h: 1.12, change24h: -0.89 },
  SOL: { price: 29.80, change1h: 2.45, change24h: 4.21 },
  DOGE: { price: 0.078, change1h: -1.23, change24h: 3.45 },
  LINK: { price: 9.20, change1h: 0.67, change24h: -1.12 },
  UNI: { price: 5.40, change1h: 1.89, change24h: 2.78 },
  AVAX: { price: 14.60, change1h: -0.45, change24h: 1.23 },
  MATIC: { price: 0.98, change1h: 0.34, change24h: -0.67 },
  DOT: { price: 5.60, change1h: 1.56, change24h: 2.89 }
};

export default function AnalystsPage() {
  const { user, canAccessPremium, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !canAccessPremium())) {
      router.push('/profile');
    }
  }, [user, loading, canAccessPremium, router]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading analyst insights...</p>
        </div>
      </div>
    );
  }

  if (!user || !canAccessPremium()) {
    return null; // Will redirect to profile
  }

  // Group all trading posts by token for analysis
  const organizedData = organizeDataByToken(mockTradingPosts);

  /**
   * UI HELPER FUNCTIONS
   */

  // Get CSS class for price change styling (positive = green, negative = red)
  const getPriceClass = (change: number) => {
    if (change > 0) return 'price-positive';
    if (change < 0) return 'price-negative';
    return 'price-neutral';
  };

  // Format price display (whole dollars for >$1, 4 decimals for < $1)
  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  // Format percentage change with +/- sign
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="container mt-4">
      {/* NAVIGATION: Breadcrumb for easy navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Analysts
          </li>
        </ol>
      </nav>

      {/* PAGE HEADER: Title and description */}
      <div className="mb-4">
        <h1 className="mb-2">Analyst Insights</h1>
        <p className="text-secondary mb-0">Comprehensive analysis and charts for each cryptocurrency</p>
      </div>

      {/* TOKEN GRID: Clickable cards for each supported cryptocurrency */}
      <div className="row g-4">
        {tokens.map((token) => {
           // Get data for this specific token
           const tokenPosts = organizedData[token] || [];
           const priceData = mockPriceData[token];
           const analystCount = new Set(tokenPosts.map(post => post.user)).size;

           return (
             <div key={token} className="col-md-6 col-lg-4">
               {/* TOKEN CARD: Links to summary page showing analyst sentiment */}
               <Link href={`/analysts/${token.toLowerCase()}/summary`} className="text-decoration-none">
                 <div className="card h-100 shadow-sm hover-card glow-orange">
                   <div className="card-body">
                     {/* TOKEN HEADER: Name, analyst count, and current price */}
                     <div className="d-flex justify-content-between align-items-start mb-3">
                       <div>
                          <h5 className="card-title mb-1 token-name">{token}</h5>
                          <small className="text-secondary">
                            {analystCount} analyst{analystCount !== 1 ? 's' : ''}
                          </small>
                       </div>
                       <div className="text-end">
                         <div className="fw-bold">{formatPrice(priceData.price)}</div>
                       </div>
                     </div>

                     {/* PRICE CHANGE INDICATORS: 1-hour and 24-hour performance */}
                     <div className="row g-2 mb-3">
                       <div className="col-6">
                         <div className="text-center p-2 bg-light rounded">
                            <small className="text-secondary d-block">1H</small>
                           <span className={`fw-bold ${getPriceClass(priceData.change1h)}`}>
                             {formatChange(priceData.change1h)}
                           </span>
                         </div>
                       </div>
                       <div className="col-6">
                         <div className="text-center p-2 bg-light rounded">
                            <small className="text-secondary d-block">24H</small>
                           <span className={`fw-bold ${getPriceClass(priceData.change24h)}`}>
                             {formatChange(priceData.change24h)}
                           </span>
                         </div>
                       </div>
                     </div>

                     {/* CARD FOOTER: Post count and call-to-action */}
                     <div className="d-flex justify-content-between align-items-center">
                        <small className="text-secondary">
                          {tokenPosts.length} analysis post{tokenPosts.length !== 1 ? 's' : ''}
                        </small>
                       <span className="badge bg-primary pulse-orange">
                         View Summary <i className="bi bi-arrow-right ms-1"></i>
                       </span>
                     </div>
                   </div>
                 </div>
               </Link>
             </div>
           );
         })}
      </div>

      {/* PLATFORM STATISTICS: Overview of the entire analyst ecosystem */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
               <h6 className="card-title text-secondary mb-3">Analysis Summary</h6>
              <div className="row text-center">
                {/* Total tokens being tracked */}
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-primary mb-1">{tokens.length}</h4>
                    <small className="text-secondary">Tokens Tracked</small>
                  </div>
                </div>

                {/* Total unique analysts across all tokens */}
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-success mb-1">
                      {new Set(mockTradingPosts.map(post => post.user)).size}
                    </h4>
                    <small className="text-secondary">Active Analysts</small>
                  </div>
                </div>

                {/* Total analysis posts in the system */}
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-info mb-1">{mockTradingPosts.length}</h4>
                    <small className="text-secondary">Total Posts</small>
                  </div>
                </div>

                {/* Average posts per token */}
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-warning mb-1">
                      {Math.round(mockTradingPosts.length / tokens.length)}
                    </h4>
                    <small className="text-secondary">Avg Posts/Token</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CROSS-PAGE NAVIGATION: Link to related features */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="text-center">
            <small className="text-secondary">
              Looking for market data and tools? Check out the{' '}
              <Link href="/tools" className="text-primary text-decoration-none">
                Tools section
              </Link>{' '}
              for trading utilities.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTopMovers, getFundingRates, type TopMover, type FundingRate } from '@/lib/toolsData';

const tools = [
  {
    id: 'top-volume',
    title: 'Top Volume',
    description: 'Track the highest volume cryptocurrencies and trading pairs',
    icon: 'bi-graph-up',
    color: 'primary',
    status: 'Available'
  },
  {
    id: 'gainers-losers',
    title: 'Gainers & Losers',
    description: 'View top performing and worst performing cryptocurrencies',
    icon: 'bi-trophy',
    color: 'success',
    status: 'Available'
  },
  {
    id: 'funding-rates',
    title: 'Funding Rates',
    description: 'Monitor perpetual futures funding rates across exchanges',
    icon: 'bi-cash-stack',
    color: 'info',
    status: 'Available'
  },
  {
    id: 'volatility',
    title: 'Volatility Analysis',
    description: 'Analyze price volatility and risk metrics for cryptocurrencies',
    icon: 'bi-bar-chart-line',
    color: 'warning',
    status: 'Available'
  },
  {
    id: 'watchlist',
    title: 'My Watchlist',
    description: 'Create and manage your personal cryptocurrency watchlist',
    icon: 'bi-star',
    color: 'secondary',
    status: 'Available'
  },
  {
    id: 'oracle-alerts',
    title: 'Oracle Alerts',
    description: 'Set up price alerts and notifications from analyst insights',
    icon: 'bi-bell',
    color: 'danger',
    status: 'Available'
  }
];

export default function ToolsPage() {
  const { user, canAccessPremium, loading } = useAuth();
  const router = useRouter();
  const [topMovers, setTopMovers] = useState<TopMover[]>([]);
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/profile');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movers, rates] = await Promise.all([
          getTopMovers(8),
          getFundingRates()
        ]);
        setTopMovers(movers);
        setFundingRates(rates);
      } catch (error) {
        console.error('Error fetching tools data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading trading tools...</p>
        </div>
      </div>
    );
  }

  if (!user || !canAccessPremium()) {
    return null; // Will redirect to profile
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Tools
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Trading Tools</h1>
        <p className="text-secondary mb-0">Essential tools for informed cryptocurrency trading decisions</p>
        <small className="text-warning d-block mt-2">
          📝 Using mock data - Will connect to tools workflow + database
        </small>
      </div>

      <div className="row g-4">
        {tools.map((tool) => (
          <div key={tool.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body text-center">
                <div className={`mb-3 text-${tool.color}`}>
                  <i className={`bi ${tool.icon} display-4`}></i>
                </div>
                <h5 className="card-title">{tool.title}</h5>
                 <p className="card-text text-secondary small">
                  {tool.description}
                </p>
                 <div className="mt-3">
                   <Link href={`/tools/${tool.id}`} className={`btn btn-${tool.color} w-100 text-decoration-none`}>
                     <i className="bi bi-play-circle me-2"></i>
                     Launch Tool
                   </Link>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Movers Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Top Movers (24h)
              </h5>
            </div>
            <div className="card-body">
              {dataLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 mb-0 small text-secondary">Loading market data...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">24h Change</th>
                        <th className="text-end">Volume</th>
                        <th className="text-end">Market Cap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMovers.map((mover) => (
                        <tr key={mover.symbol}>
                          <td>
                            <strong>{mover.token}</strong>
                            <br />
                            <small className="text-muted">{mover.symbol}</small>
                          </td>
                          <td className="text-end">
                            ${mover.price.toLocaleString()}
                          </td>
                          <td className={`text-end ${mover.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                            <i className={`bi bi-arrow-${mover.change24h >= 0 ? 'up' : 'down'} me-1`}></i>
                            {mover.change24h >= 0 ? '+' : ''}{mover.change24h.toFixed(2)}%
                          </td>
                          <td className="text-end">
                            ${(mover.volume24h / 1000000000).toFixed(2)}B
                          </td>
                          <td className="text-end">
                            ${(mover.marketCap / 1000000000).toFixed(2)}B
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Funding Rates Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-cash-stack me-2"></i>
                Funding Rates
              </h5>
            </div>
            <div className="card-body">
              {dataLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 mb-0 small text-secondary">Loading funding rates...</p>
                </div>
              ) : (
                <div className="row g-3">
                  {fundingRates.map((rate, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                      <div className="border rounded p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-0">{rate.token}</h6>
                            <small className="text-muted">{rate.exchange}</small>
                          </div>
                          <span className={`badge ${rate.rate >= 0 ? 'bg-success' : 'bg-danger'}`}>
                            {(rate.rate * 100).toFixed(3)}%
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-secondary">
                            <i className="bi bi-clock me-1"></i>
                            Next: {new Date(rate.nextFunding).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                          <small className="text-muted">
                            Pred: {(rate.predictedRate * 100).toFixed(3)}%
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-secondary mb-3">Quick Actions</h6>
              <div className="d-flex flex-wrap gap-2">
                <Link href="/analysts" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-graph-up me-1"></i>
                  View Analyst Insights
                </Link>
                <Link href="/profile" className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-person me-1"></i>
                  Manage Profile
                </Link>
                <button className="btn btn-outline-info btn-sm" disabled>
                  <i className="bi bi-bell me-1"></i>
                  Set Alerts
                </button>
                <button className="btn btn-outline-success btn-sm" disabled>
                  <i className="bi bi-star me-1"></i>
                  Create Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Navigation */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="text-center">
            <small className="text-secondary">
              Need detailed analysis? Visit the{' '}
              <Link href="/analysts" className="text-primary text-decoration-none">
                Analysts section
              </Link>{' '}
              for comprehensive token insights.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
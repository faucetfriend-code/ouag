'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    status: 'Coming Soon'
  },
  {
    id: 'volatility',
    title: 'Volatility Analysis',
    description: 'Analyze price volatility and risk metrics for cryptocurrencies',
    icon: 'bi-bar-chart-line',
    color: 'warning',
    status: 'Coming Soon'
  },
  {
    id: 'watchlist',
    title: 'My Watchlist',
    description: 'Create and manage your personal cryptocurrency watchlist',
    icon: 'bi-star',
    color: 'secondary',
    status: 'Coming Soon'
  },
  {
    id: 'oracle-alerts',
    title: 'Oracle Alerts',
    description: 'Set up price alerts and notifications from analyst insights',
    icon: 'bi-bell',
    color: 'danger',
    status: 'Coming Soon'
  }
];

export default function ToolsPage() {
  const { user, canAccessPremium, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/profile');
    }
  }, [user, loading, router]);

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
      </div>

      <div className="row g-4">
        {tools.map((tool) => (
          <div key={tool.id} className="col-md-6 col-lg-4">
            <div className={`card h-100 shadow-sm ${tool.status === 'Available' ? 'hover-card' : 'opacity-50'}`}>
              <div className="card-body text-center">
                <div className={`mb-3 text-${tool.color}`}>
                  <i className={`bi ${tool.icon} display-4`}></i>
                </div>
                <h5 className="card-title">{tool.title}</h5>
                 <p className="card-text text-secondary small">
                  {tool.description}
                </p>
                <div className="mt-3">
                  {tool.status === 'Available' ? (
                    <button className={`btn btn-${tool.color} w-100`} disabled>
                      <i className="bi bi-play-circle me-2"></i>
                      Launch Tool
                    </button>
                  ) : (
                    <span className="badge bg-secondary w-100 py-2">
                      <i className="bi bi-clock me-1"></i>
                      {tool.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Overview Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Market Overview</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-success mb-1">$1.2T</h4>
                     <small className="text-secondary">Total Market Cap</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-primary mb-1">$45B</h4>
                     <small className="text-secondary">24h Volume</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-info mb-1">BTC 52%</h4>
                     <small className="text-secondary">BTC Dominance</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-warning mb-1">1,847</h4>
                     <small className="text-secondary">Active Cryptos</small>
                  </div>
                </div>
              </div>
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
/**
 * Home Page Component
 *
 * Landing page showcasing the main features of the Unity Oracle Aggregator.
 * Displays navigation cards for Profile, Trading Tools, and Analyst Insights.
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, login, logout, loading } = useAuth();

  return (
    <>
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link href="/" className="navbar-brand">
            <i className="bi bi-graph-up me-2"></i>
            Unity Oracle
          </Link>

          <div className="navbar-nav ms-auto">
            {loading ? (
              <div className="navbar-text">
                <div className="spinner-border spinner-border-sm text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : user ? (
              <div className="navbar-nav">
                <Link href="/profile" className="nav-link">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.username}
                </Link>
                <button onClick={logout} className="btn btn-outline-light btn-sm ms-2">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={login} className="btn btn-primary btn-sm">
                <i className="bi bi-discord me-1"></i>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container mt-5">
      {/* HERO SECTION: Main branding and feature highlights */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3 glow-orange">Unity Oracle Aggregator</h1>
        <p className="lead text-secondary">Your comprehensive crypto trading intelligence platform</p>

        {/* FEATURE BADGES: Key selling points */}
        <div className="mt-3">
          <span className="badge bg-warning text-dark me-2">Advanced AI Analysis</span>
          <span className="badge bg-danger me-2">Real-time Data</span>
          <span className="badge bg-primary">Expert Insights</span>
        </div>
      </div>

      {/* FEATURE CARDS: Main navigation to app sections */}
      <div className="row g-4">
        {/* PROFILE CARD: User account management */}
        <div className="col-md-4">
          <div className="card h-100 shadow-sm hover-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-person-circle display-4 text-primary pulse-orange"></i>
              </div>
              <h5 className="card-title">Profile</h5>
              <p className="card-text text-secondary">
                Manage your portfolio, view your trading history, and customize your preferences.
              </p>
              <Link href="/profile" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Go to Profile
              </Link>
            </div>
          </div>
        </div>

        {/* TRADING TOOLS CARD: Market data and analysis tools */}
        <div className="col-md-4">
          <div className="card h-100 shadow-sm hover-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-tools display-4 text-warning pulse-red"></i>
              </div>
              <h5 className="card-title">Trading Tools</h5>
              <p className="card-text text-secondary">
                Access market data, top movers, funding rates, volatility analysis, and more.
              </p>
              <Link href="/tools" className="btn btn-success">
                <i className="bi bi-arrow-right-circle me-2"></i>
                View Tools
              </Link>
            </div>
          </div>
        </div>

        {/* ANALYST INSIGHTS CARD: Expert analysis and sentiment */}
        <div className="col-md-4">
          <div className="card h-100 shadow-sm hover-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-graph-up display-4 text-danger glow-red"></i>
              </div>
              <h5 className="card-title">Analyst Insights</h5>
              <p className="card-text text-secondary">
                Explore detailed analysis and charts for each cryptocurrency from our expert analysts.
              </p>
              <Link href="/analysts" className="btn btn-info">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Browse Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* PLATFORM STATISTICS: Key metrics showcasing platform value */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-secondary mb-3">Platform Overview</h6>
              <div className="row text-center">
                {/* Total expert analysts contributing to the platform */}
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-primary mb-1">15</h4>
                    <small className="text-secondary">Expert Analysts</small>
                  </div>
                </div>

                {/* Number of cryptocurrencies being tracked */}
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-success mb-1">10</h4>
                    <small className="text-secondary">Tracked Tokens</small>
                  </div>
                </div>

                {/* Total analysis posts in the system */}
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-info mb-1">37</h4>
                    <small className="text-secondary">Analysis Posts</small>
                  </div>
                </div>

                {/* Market coverage availability */}
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-warning mb-1">24/7</h4>
                    <small className="text-secondary">Market Coverage</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
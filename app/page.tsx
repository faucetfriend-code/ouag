/**
 * Home Page Component
 *
 * Landing page showcasing the main features of the Unity Oracle Aggregator.
 * Displays navigation cards for Profile, Trading Tools, and Analyst Insights.
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import DataSourceToggle from '@/components/DataSourceToggle';

export default function Home() {
  const { user, login, logout, loading, canAccessPremium, grantTestAccess } = useAuth();

  return (
    <div className="container mt-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Home
          </li>
        </ol>
      </nav>

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

        {/* TEST ACCESS BUTTON: For development/testing */}
        {user && !canAccessPremium() && (
          <div className="mt-4">
            <button onClick={grantTestAccess} className="btn btn-success btn-lg">
              <i className="bi bi-unlock me-2"></i>
              Grant Test Access
            </button>
            <p className="text-secondary mt-2 small">Enable premium features for testing</p>
          </div>
        )}
      </div>

      {/* DATA SOURCE TOGGLE: Switch between mock and Redis data */}
      <div className="row mb-4">
        <div className="col-12">
          <DataSourceToggle />
        </div>
      </div>

      {/* FEATURE CARDS: Main navigation to app sections */}
      <div className="row g-4">
        {/* PROFILE CARD: User account management */}
        <div className="col-lg-6 col-md-6">
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
        <div className="col-lg-6 col-md-6">
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
        <div className="col-lg-6 col-md-6">
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

        {/* ANALYST COMMENTS CARD: Direct access to analyst discussions */}
        <div className="col-lg-6 col-md-6">
          <div className="card h-100 shadow-sm hover-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-chat-quote display-4 text-info pulse-blue"></i>
              </div>
              <h5 className="card-title">Analyst Comments</h5>
              <p className="card-text text-secondary">
                Read raw analyst comments and discussions for real-time market sentiment.
              </p>
              <Link href="/comments" className="btn btn-secondary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                View Comments
              </Link>
            </div>
          </div>
        </div>

        {/* NEWS FEED CARD: Latest crypto news and updates */}
        <div className="col-lg-6 col-md-6">
          <div className="card h-100 shadow-sm hover-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-newspaper display-4 text-success pulse-green"></i>
              </div>
              <h5 className="card-title">News Feed</h5>
              <p className="card-text text-secondary">
                Stay updated with the latest cryptocurrency news, market developments, and breaking stories.
              </p>
              <Link href="/news" className="btn btn-success">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Read News
              </Link>
            </div>
          </div>
        </div>

        {/* AIRDROP GUIDE CARD: Crypto airdrops and opportunities */}
        <div className="col-lg-6 col-md-6">
          <div className="card h-100 shadow-sm hover-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-gift display-4 text-danger pulse-red"></i>
              </div>
              <h5 className="card-title">Airdrop Guide</h5>
              <p className="card-text text-secondary">
                Discover active and upcoming airdrops, eligibility criteria, and step-by-step claim instructions.
              </p>
              <Link href="/airdrops" className="btn btn-danger">
                <i className="bi bi-arrow-right-circle me-2"></i>
                View Airdrops
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
   );
 }
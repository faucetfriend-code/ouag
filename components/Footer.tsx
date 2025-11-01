/**
 * Footer Component
 *
 * Site-wide footer with branding, navigation links, and platform statistics.
 * Provides consistent footer across all pages.
 */

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-light mt-5 py-4">
      <div className="container">
        <div className="row">
          {/* BRAND SECTION: Company info and tagline */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold text-primary">Unity Oracle Aggregator</h6>
            <p className="small text-secondary mb-0">
              Your comprehensive crypto trading intelligence platform
            </p>
          </div>

          {/* NAVIGATION LINKS: Quick access to main sections */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Quick Links</h6>
            <div className="d-flex flex-column">
              <Link href="/" className="text-decoration-none small mb-1">
                <i className="bi bi-house me-1"></i>
                Home
              </Link>
              <Link href="/profile" className="text-decoration-none small mb-1">
                <i className="bi bi-person me-1"></i>
                Profile
              </Link>
              <Link href="/tools" className="text-decoration-none small mb-1">
                <i className="bi bi-tools me-1"></i>
                Trading Tools
              </Link>
              <Link href="/analysts" className="text-decoration-none small mb-1">
                <i className="bi bi-graph-up me-1"></i>
                Analyst Insights
              </Link>
            </div>
          </div>

          {/* PLATFORM STATISTICS: Key metrics overview */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Market Overview</h6>
            <div className="small text-secondary">
              <div className="d-flex justify-content-between mb-1">
                <span>Tokens Tracked:</span>
                <span className="fw-bold">10</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Active Analysts:</span>
                <span className="fw-bold">15</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Total Posts:</span>
                <span className="fw-bold">37</span>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT NOTICE */}
        <hr className="my-3" />
        <div className="text-center small text-secondary">
          <p className="mb-0">
            © 2024 Unity Oracle Aggregator. Built for crypto traders, by crypto traders.
          </p>
        </div>
      </div>
    </footer>
  );
}
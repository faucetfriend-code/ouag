import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3 glow-orange">Unity Oracle Aggregator</h1>
        <p className="lead text-muted">Your comprehensive crypto trading intelligence platform</p>
        <div className="mt-3">
          <span className="badge bg-warning text-dark me-2">Advanced AI Analysis</span>
          <span className="badge bg-danger me-2">Real-time Data</span>
          <span className="badge bg-primary">Expert Insights</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Section */}
        <div className="col-md-4">
          <div className="card h-100 shadow-sm hover-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-person-circle display-4 text-primary pulse-orange"></i>
              </div>
              <h5 className="card-title">Profile</h5>
              <p className="card-text text-muted">
                Manage your portfolio, view your trading history, and customize your preferences.
              </p>
              <Link href="/profile" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Go to Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="col-md-4">
          <div className="card h-100 shadow-sm hover-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-tools display-4 text-warning pulse-red"></i>
              </div>
              <h5 className="card-title">Trading Tools</h5>
              <p className="card-text text-muted">
                Access market data, top movers, funding rates, volatility analysis, and more.
              </p>
              <Link href="/tools" className="btn btn-success">
                <i className="bi bi-arrow-right-circle me-2"></i>
                View Tools
              </Link>
            </div>
          </div>
        </div>

        {/* Analysts Section */}
        <div className="col-md-4">
          <div className="card h-100 shadow-sm hover-card">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-graph-up display-4 text-danger glow-red"></i>
              </div>
              <h5 className="card-title">Analyst Insights</h5>
              <p className="card-text text-muted">
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

      {/* Quick Stats */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-3">Platform Overview</h6>
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-primary mb-1">15</h4>
                    <small className="text-muted">Expert Analysts</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-success mb-1">10</h4>
                    <small className="text-muted">Tracked Tokens</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-info mb-1">37</h4>
                    <small className="text-muted">Analysis Posts</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-warning mb-1">24/7</h4>
                    <small className="text-muted">Market Coverage</small>
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
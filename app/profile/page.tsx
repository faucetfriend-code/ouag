import Link from 'next/link';

// Mock user data
const userProfile = {
  name: 'Alex Thompson',
  email: 'alex.thompson@example.com',
  joinDate: 'January 2024',
  avatar: 'AT',
  bio: 'Passionate crypto trader and analyst with 3+ years of experience in technical analysis and DeFi.'
};

const portfolio = [
  { token: 'BTC', amount: 0.5, value: 29375, change24h: 2.34 },
  { token: 'ETH', amount: 5.2, value: 10140, change24h: 1.67 },
  { token: 'ADA', amount: 2500, value: 1050, change24h: -0.89 },
  { token: 'SOL', amount: 25, value: 745, change24h: 4.21 }
];

const totalPortfolioValue = portfolio.reduce((sum, holding) => sum + holding.value, 0);
const totalChange24h = portfolio.reduce((sum, holding) => sum + (holding.value * holding.change24h / 100), 0);

export default function ProfilePage() {
  const getPriceClass = (change: number) => {
    if (change > 0) return 'price-positive';
    if (change < 0) return 'price-negative';
    return 'price-neutral';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Profile
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Profile</h1>
        <p className="text-muted mb-0">Manage your account, portfolio, and trading preferences</p>
      </div>

      <div className="row">
        {/* Profile Information */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                     style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}>
                  {userProfile.avatar}
                </div>
              </div>
              <h5 className="card-title mb-1">{userProfile.name}</h5>
              <p className="text-muted small mb-2">{userProfile.email}</p>
              <p className="text-muted small mb-3">Member since {userProfile.joinDate}</p>
              <p className="card-text small">{userProfile.bio}</p>
              <button className="btn btn-outline-primary btn-sm w-100" disabled>
                <i className="bi bi-pencil me-2"></i>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Account Settings */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Account Settings</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-secondary btn-sm text-start" disabled>
                  <i className="bi bi-shield-check me-2"></i>
                  Security Settings
                </button>
                <button className="btn btn-outline-secondary btn-sm text-start" disabled>
                  <i className="bi bi-bell me-2"></i>
                  Notification Preferences
                </button>
                <button className="btn btn-outline-secondary btn-sm text-start" disabled>
                  <i className="bi bi-palette me-2"></i>
                  Theme Settings
                </button>
                <button className="btn btn-outline-secondary btn-sm text-start" disabled>
                  <i className="bi bi-currency-exchange me-2"></i>
                  Currency Preferences
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Portfolio Overview</h5>
              <div className="text-end">
                <div className="h5 mb-0">{formatCurrency(totalPortfolioValue)}</div>
                <small className={`fw-bold ${getPriceClass(totalChange24h)}`}>
                  {totalChange24h >= 0 ? '+' : ''}{formatCurrency(totalChange24h)} (24h)
                </small>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th className="text-end">Holdings</th>
                      <th className="text-end">Value</th>
                      <th className="text-end">24h Change</th>
                      <th className="text-end">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((holding) => (
                      <tr key={holding.token}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                                 style={{ width: '32px', height: '32px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {holding.token.slice(0, 2)}
                            </div>
                            <div>
                              <div className="fw-bold">{holding.token}</div>
                              <small className="text-muted">{holding.amount} {holding.token}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-end">
                          <div>{holding.amount}</div>
                          <small className="text-muted">{holding.token}</small>
                        </td>
                        <td className="text-end fw-bold">
                          {formatCurrency(holding.value)}
                        </td>
                        <td className={`text-end ${getPriceClass(holding.change24h)}`}>
                          {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                        </td>
                        <td className="text-end">
                          {((holding.value / totalPortfolioValue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Trading Preferences */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Trading Preferences</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Risk Tolerance</h6>
                  <div className="mb-3">
                    <select className="form-select" disabled>
                      <option>Conservative</option>
                      <option>Moderate</option>
                      <option>Aggressive</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>Default Timeframe</h6>
                  <div className="mb-3">
                    <select className="form-select" disabled>
                      <option>1 Hour</option>
                      <option>4 Hours</option>
                      <option>1 Day</option>
                      <option>1 Week</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h6>Notification Settings</h6>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" disabled />
                    <label className="form-check-label small">
                      Price alerts for portfolio assets
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" disabled />
                    <label className="form-check-label small">
                      New analyst insights
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>Analysis Preferences</h6>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" disabled defaultChecked />
                    <label className="form-check-label small">
                      Technical analysis
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" disabled defaultChecked />
                    <label className="form-check-label small">
                      Fundamental analysis
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                <div className="timeline-item mb-3">
                  <div className="timeline-marker bg-success"></div>
                  <div className="timeline-content">
                    <small className="text-muted">2 hours ago</small>
                    <div>Viewed BTC analysis from btc_analyst1</div>
                  </div>
                </div>
                <div className="timeline-item mb-3">
                  <div className="timeline-marker bg-info"></div>
                  <div className="timeline-content">
                    <small className="text-muted">1 day ago</small>
                    <div>Updated portfolio holdings</div>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker bg-primary"></div>
                  <div className="timeline-content">
                    <small className="text-muted">3 days ago</small>
                    <div>Joined Unity Oracle Aggregator</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Navigation */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="text-center">
            <small className="text-muted">
              Ready to trade? Explore{' '}
              <Link href="/analysts" className="text-primary text-decoration-none">
                analyst insights
              </Link>{' '}
              or check{' '}
              <Link href="/tools" className="text-success text-decoration-none">
                trading tools
              </Link>
              .
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
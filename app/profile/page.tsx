'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useUserPreferences } from '@/lib/user-preferences-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RecentActivityFeed from '@/components/RecentActivityFeed';
import SecuritySettingsModal from '@/components/settings/SecuritySettingsModal';
import NotificationSettingsModal from '@/components/settings/NotificationSettingsModal';
import CurrencySettingsModal from '@/components/settings/CurrencySettingsModal';
import PositionTracker from '@/components/PositionTracker';
import PortfolioImportModal from '@/components/PortfolioImportModal';

// Force dynamic rendering to avoid issues with NextAuth during static generation
export const dynamic = 'force-dynamic';

interface PortfolioHolding {
  id: string;
  token: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  change24h: number;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioData {
  id: string | null;
  totalValue: number;
  totalChange24h: number;
  holdings: PortfolioHolding[];
  lastUpdated: string;
}

export default function ProfilePage() {
  const { user, login, logout, loading, grantTestAccess } = useAuth();
  const { preferences, updateTradingPreferences, updateNotificationSettings, updateAnalysisPreferences, savePreferences, unfavoriteAnalyst } = useUserPreferences();
  const router = useRouter();

  // Modal states
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Portfolio state
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    id: null,
    totalValue: 0,
    totalChange24h: 0,
    holdings: [],
    lastUpdated: ''
  });
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // Load portfolio data
  const loadPortfolio = async () => {
    if (!user) return;

    setPortfolioLoading(true);
    try {
      const response = await fetch('/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  // Refresh portfolio prices
  const refreshPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio/refresh', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolio(prev => ({
          ...prev,
          totalValue: data.totalValue,
          totalChange24h: data.totalChange24h,
          holdings: data.holdings,
          lastUpdated: data.lastUpdated
        }));
      }
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h1 className="mb-3">Profile</h1>
          <p className="text-secondary mb-4">Please log in to view your profile information.</p>
          <button onClick={login} className="btn btn-primary">
            <i className="bi bi-discord me-2"></i>
            Login with Discord
          </button>
        </div>
      </div>
    );
  }
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
         <p className="text-secondary mb-0">Manage your account, portfolio, and trading preferences</p>
       </div>

       {/* Subscription Status */}
       <div className="row mb-4">
         <div className="col-12">
           <div className={`card ${user.subscription?.active ? 'border-success' : 'border-warning'}`}>
             <div className="card-body">
               <div className="d-flex justify-content-between align-items-center">
                 <div>
                   <h5 className="card-title mb-1">
                     <i className={`bi ${user.subscription?.active ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'} me-2`}></i>
                     {user.subscription?.active ? 'Premium Subscription Active' : 'No Active Subscription'}
                   </h5>
                   {user.subscription?.active && user.subscription.endDate && (
                      <p className="text-secondary mb-0">
                        Expires: {new Date(user.subscription.endDate).toLocaleDateString()}
                      </p>
                   )}
                   {!user.subscription?.active && (
                      <p className="text-secondary mb-0">
                        Subscribe to access premium features and analyst insights.
                      </p>
                   )}
                 </div>
                  <div>
                  {!user.subscription?.active && (
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary" onClick={grantTestAccess}>
                        <i className="bi bi-star me-2"></i>
                        Grant Test Access
                      </button>
                      <Link href="/settings/subscription" className="btn btn-outline-primary">
                        <i className="bi bi-credit-card me-2"></i>
                        Subscribe Now
                      </Link>
                    </div>
                  )}
                  {user.subscription?.active && (
                    <Link href="/settings/subscription" className="btn btn-outline-primary">
                      <i className="bi bi-gear me-2"></i>
                      Manage Subscription
                    </Link>
                  )}
                  </div>
               </div>
             </div>
           </div>
         </div>
       </div>

      <div className="row">
         {/* Profile Information */}
         <div className="col-lg-4 mb-4">
           <div className="card">
             <div className="card-body text-center">
               <div className="mb-3">
                 {user.avatar ? (
                   <img
                     src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                     alt="Discord Avatar"
                     className="rounded-circle"
                     style={{ width: '80px', height: '80px' }}
                   />
                 ) : (
                   <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}>
                     {(user.username || 'U').charAt(0).toUpperCase()}
                   </div>
                 )}
               </div>
               <h5 className="card-title mb-1">{user.username || 'Unknown'}#{user.discriminator}</h5>
               {user.email && <p className="text-secondary small mb-2">{user.email}</p>}
               <div className="mb-3">
                 <span className={`badge ${user.isServerMember ? 'bg-success' : 'bg-danger'}`}>
                   <i className={`bi ${user.isServerMember ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                   {user.isServerMember ? 'Server Member' : 'Not a Member'}
                 </span>
               </div>
               <p className="card-text small text-secondary">
                 Discord user connected and verified.
               </p>
               <button onClick={logout} className="btn btn-outline-danger btn-sm w-100">
                 <i className="bi bi-box-arrow-right me-2"></i>
                 Logout
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
                 <button
                   className="btn btn-outline-primary btn-sm text-start"
                   onClick={() => setShowSecurityModal(true)}
                 >
                   <i className="bi bi-shield-check me-2"></i>
                   Security Settings
                 </button>
                 <button
                   className="btn btn-outline-primary btn-sm text-start"
                   onClick={() => setShowNotificationModal(true)}
                 >
                   <i className="bi bi-bell me-2"></i>
                   Notification Preferences
                 </button>
                 <button
                   className="btn btn-outline-primary btn-sm text-start"
                   onClick={() => setShowCurrencyModal(true)}
                 >
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
               <div className="d-flex gap-2">
                 <button
                   className="btn btn-outline-primary btn-sm"
                   onClick={() => setShowImportModal(true)}
                 >
                   <i className="bi bi-upload me-1"></i>
                   Import
                 </button>
                 <button
                   className="btn btn-outline-secondary btn-sm"
                   onClick={refreshPortfolio}
                   disabled={portfolioLoading}
                 >
                   {portfolioLoading ? (
                     <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                   ) : (
                     <i className="bi bi-arrow-clockwise me-1"></i>
                   )}
                   Refresh
                 </button>
               </div>
             </div>
             <div className="card-body">
               {portfolio.holdings.length === 0 ? (
                 <div className="text-center py-5">
                   <i className="bi bi-pie-chart display-4 text-secondary mb-3"></i>
                   <h5 className="text-secondary">No Portfolio Data</h5>
                   <p className="text-secondary mb-3">Import your portfolio to start tracking your investments</p>
                   <button
                     className="btn btn-primary"
                     onClick={() => setShowImportModal(true)}
                   >
                     <i className="bi bi-upload me-2"></i>
                     Import Portfolio
                   </button>
                 </div>
               ) : (
                 <>
                   <div className="row mb-3">
                     <div className="col-md-6">
                       <div className="text-center">
                         <div className="h4 mb-0">{formatCurrency(portfolio.totalValue)}</div>
                         <small className="text-secondary">Total Value</small>
                       </div>
                     </div>
                     <div className="col-md-6">
                       <div className="text-center">
                         <div className={`h4 mb-0 ${getPriceClass(portfolio.totalChange24h)}`}>
                           {portfolio.totalChange24h >= 0 ? '+' : ''}{formatCurrency(portfolio.totalChange24h)}
                         </div>
                         <small className="text-secondary">24h Change</small>
                       </div>
                     </div>
                   </div>

                   <div className="table-responsive">
                     <table className="table table-hover">
                       <thead>
                         <tr>
                           <th>Asset</th>
                           <th className="text-end">Holdings</th>
                           <th className="text-end">Avg Price</th>
                           <th className="text-end">Current Price</th>
                           <th className="text-end">Value</th>
                           <th className="text-end">24h Change</th>
                           <th className="text-end">Allocation</th>
                         </tr>
                       </thead>
                       <tbody>
                         {portfolio.holdings.map((holding) => (
                           <tr key={holding.id}>
                             <td>
                               <div className="d-flex align-items-center">
                                 <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                                      style={{ width: '32px', height: '32px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                   {holding.token.slice(0, 2)}
                                 </div>
                                 <div>
                                   <div className="fw-bold">{holding.token}</div>
                                   <small className="text-secondary">{holding.amount.toFixed(8)} {holding.token}</small>
                                 </div>
                               </div>
                             </td>
                             <td className="text-end">
                               <div>{holding.amount.toFixed(8)}</div>
                               <small className="text-secondary">{holding.token}</small>
                             </td>
                             <td className="text-end">
                               {formatCurrency(holding.avgPrice)}
                             </td>
                             <td className="text-end fw-bold">
                               {holding.currentPrice > 0 ? formatCurrency(holding.currentPrice) : 'N/A'}
                             </td>
                             <td className="text-end fw-bold">
                               {formatCurrency(holding.value)}
                             </td>
                             <td className={`text-end ${getPriceClass(holding.change24h)}`}>
                               {holding.change24h !== 0 ? (
                                 <>
                                   {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                                 </>
                               ) : (
                                 <span className="text-secondary">-</span>
                               )}
                             </td>
                             <td className="text-end">
                               {portfolio.totalValue > 0 ? ((holding.value / portfolio.totalValue) * 100).toFixed(1) : '0.0'}%
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>

                   {portfolio.lastUpdated && (
                     <div className="text-center mt-3">
                       <small className="text-secondary">
                         Last updated: {new Date(portfolio.lastUpdated).toLocaleString()}
                       </small>
                     </div>
                   )}
                 </>
               )}
             </div>
           </div>

          {/* Position Tracker */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-lightning-charge me-2"></i>
                Leveraged Positions
              </h5>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-plus-circle me-2"></i>
                Add Position
              </button>
            </div>
            <div className="card-body">
              <PositionTracker />
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
                    <select
                      className="form-select"
                      value={preferences?.tradingPreferences.riskTolerance || 'Moderate'}
                      onChange={(e) => updateTradingPreferences({ riskTolerance: e.target.value as 'Conservative' | 'Moderate' | 'Aggressive' })}
                    >
                      <option value="Conservative">Conservative</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>Default Timeframe</h6>
                  <div className="mb-3">
                    <select
                      className="form-select"
                      value={preferences?.tradingPreferences.defaultTimeframe || '1d'}
                      onChange={(e) => updateTradingPreferences({ defaultTimeframe: e.target.value as '1h' | '4h' | '1d' | '1w' })}
                    >
                      <option value="1h">1 Hour</option>
                      <option value="4h">4 Hours</option>
                      <option value="1d">1 Day</option>
                      <option value="1w">1 Week</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h6>Notification Settings</h6>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={preferences?.notificationSettings.priceAlerts || false}
                      onChange={(e) => updateNotificationSettings({ priceAlerts: e.target.checked })}
                    />
                    <label className="form-check-label small">
                      Price alerts for portfolio assets
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={preferences?.notificationSettings.analystInsights || false}
                      onChange={(e) => updateNotificationSettings({ analystInsights: e.target.checked })}
                    />
                    <label className="form-check-label small">
                      New analyst insights
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6>Analysis Preferences</h6>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={preferences?.analysisPreferences.technicalAnalysis !== false}
                      onChange={(e) => updateAnalysisPreferences({ technicalAnalysis: e.target.checked })}
                    />
                    <label className="form-check-label small">
                      Technical analysis
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={preferences?.analysisPreferences.fundamentalAnalysis !== false}
                      onChange={(e) => updateAnalysisPreferences({ fundamentalAnalysis: e.target.checked })}
                    />
                    <label className="form-check-label small">
                      Fundamental analysis
                    </label>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Followed Analysts */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-heart-fill me-2"></i>
                Followed Analysts
              </h5>
            </div>
            <div className="card-body">
              {!preferences || preferences.favoriteAnalysts.length === 0 ? (
                <div className="text-center text-secondary py-4">
                  <i className="bi bi-heart display-4 mb-3 d-block"></i>
                  <p className="mb-0">You're not following any analysts yet.</p>
                  <small>Visit the <Link href="/analysts" className="text-primary">Analysts page</Link> to discover and follow analysts.</small>
                </div>
              ) : (
                <div className="row g-3">
                  {preferences.favoriteAnalysts.map((analystUsername) => (
                    <div key={analystUsername} className="col-md-6">
                      <div className="card h-100 hover-card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-center">
                              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                   style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {analystUsername.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h6 className="mb-0">@{analystUsername}</h6>
                                <small className="text-secondary">Crypto Analyst</small>
                              </div>
                            </div>
                            <div>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => preferences && unfavoriteAnalyst(analystUsername)}
                                title="Unfollow"
                              >
                                <i className="bi bi-heart-fill"></i>
                              </button>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Link
                              href={`/profile/analyst/${analystUsername}`}
                              className="btn btn-sm btn-outline-primary w-100"
                            >
                              <i className="bi bi-person me-1"></i>
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Activity from Followed Analysts
              </h5>
            </div>
            <div className="card-body">
              <RecentActivityFeed />
            </div>
          </div>
        </div>
      </div>

      {/* Related Navigation */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="text-center">
            <small className="text-secondary">
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

       {/* Settings Modals */}
       <SecuritySettingsModal
         show={showSecurityModal}
         onHide={() => setShowSecurityModal(false)}
       />
       <NotificationSettingsModal
         show={showNotificationModal}
         onHide={() => setShowNotificationModal(false)}
       />
       <CurrencySettingsModal
         show={showCurrencyModal}
         onHide={() => setShowCurrencyModal(false)}
       />
       <PortfolioImportModal
         show={showImportModal}
         onHide={() => setShowImportModal(false)}
         onImportComplete={loadPortfolio}
       />
     </div>
   );
 }
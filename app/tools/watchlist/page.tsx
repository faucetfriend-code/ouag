'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface WatchlistToken {
  token: string;
  pair: string;
  price: string;
  change24h: string;
  volume: string;
  alerts: number;
}

export default function WatchlistPage() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [addingToken, setAddingToken] = useState(false);

  const fetchWatchlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tools/watchlist');

      if (response.ok) {
        const result = await response.json();
        setWatchlist(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!newToken.trim() || !user) return;

    setAddingToken(true);
    try {
      const response = await fetch('/api/tools/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: newToken.toUpperCase() })
      });

      if (response.ok) {
        setNewToken('');
        fetchWatchlist();
      }
    } catch (error) {
      console.error('Error adding token:', error);
    } finally {
      setAddingToken(false);
    }
  };

  const removeFromWatchlist = async (token: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/tools/watchlist?token=${token}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchWatchlist();
      }
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/tools" className="text-decoration-none">Tools</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">My Watchlist</li>
        </ol>
      </nav>

      {/* Dashboard Header */}
      <div className="card mb-4 bg-dark text-white">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-star display-6 me-3 text-warning"></i>
            <div>
              <h1 className="h3 mb-1">My Watchlist</h1>
              <p className="mb-0 text-light">
                Create and manage your personal cryptocurrency watchlist with custom alerts
              </p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-secondary rounded p-4 text-center" style={{ minHeight: '200px' }}>
            <div className="d-flex align-items-center justify-content-center h-100">
              <div>
                <h2 className="h1">MSS Watchlist</h2>
                <p className="mt-3 text-light">
                  Track your favorite tokens and receive market structure signals
                </p>
              </div>
            </div>
            <div className="d-flex justify-content-around mt-4 text-light">
              <div><i className="bi bi-star me-2"></i>CustomTokens</div>
              <div><i className="bi bi-bell me-2"></i>PriceAlerts</div>
              <div><i className="bi bi-graph-up me-2"></i>MSSSignals</div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <a href="https://discord.gg/unityacademy" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
              <i className="bi bi-discord me-2"></i>
              discord.gg/unityacademy
            </a>
          </div>
        </div>
      </div>

      {user ? (
        <>
          {/* Add Token Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h6 className="card-title mb-3">
                <i className="bi bi-plus-circle me-2"></i>
                Add Token to Watchlist
              </h6>
              <div className="row g-3">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter token symbol (e.g., BTC, ETH, SOL)"
                    value={newToken}
                    onChange={(e) => setNewToken(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addToWatchlist()}
                  />
                </div>
                <div className="col-md-4">
                  <button
                    onClick={addToWatchlist}
                    className="btn btn-primary w-100"
                    disabled={!newToken.trim() || addingToken}
                  >
                    {addingToken ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-lg me-2"></i>
                        Add Token
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Watchlist Display */}
          {loading ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 mb-0">Loading your watchlist...</p>
              </div>
            </div>
          ) : watchlist.length > 0 ? (
            <div className="card">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="bi bi-list-stars me-2"></i>
                  Your Watchlist ({watchlist.length} tokens)
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Token</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">24h Change</th>
                        <th className="text-end">Volume</th>
                        <th className="text-center">Alerts</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchlist.map((item) => (
                        <tr key={item.token}>
                          <td>
                            <strong>{item.token}</strong>
                            <br />
                            <small className="text-muted">{item.pair}</small>
                          </td>
                          <td className="text-end fw-bold">{item.price}</td>
                          <td className={`text-end fw-bold ${
                            parseFloat(item.change24h) >= 0 ? 'text-success' : 'text-danger'
                          }`}>
                            {item.change24h}
                          </td>
                          <td className="text-end">{item.volume}</td>
                          <td className="text-center">
                            {item.alerts > 0 ? (
                              <span className="badge bg-danger">{item.alerts}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => removeFromWatchlist(item.token)}
                              className="btn btn-sm btn-outline-danger"
                              title="Remove from watchlist"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-star display-4 text-muted mb-3"></i>
                <h5 className="mb-2">Your watchlist is empty</h5>
                <p className="text-muted mb-0">
                  Add tokens above to start tracking them
                </p>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="card mt-4">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-lightbulb text-warning me-2"></i>
                Watchlist Features
              </h6>
              <ul className="mb-0 small">
                <li><strong>Custom Tokens:</strong> Add any cryptocurrency to track</li>
                <li><strong>Price Alerts:</strong> Get notified of significant price changes</li>
                <li><strong>MSS Signals:</strong> Receive market structure shift alerts for watched tokens</li>
                <li><strong>Volume Tracking:</strong> Monitor volume changes and spikes</li>
                <li>Watchlist syncs across all your devices</li>
                <li>Set custom alert thresholds for each token</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-lock display-4 text-muted mb-3"></i>
            <h5 className="mb-2">Login Required</h5>
            <p className="text-muted mb-3">
              Please log in to access your personal watchlist
            </p>
            <Link href="/profile" className="btn btn-primary">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

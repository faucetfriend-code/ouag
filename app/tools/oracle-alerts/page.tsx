'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OracleAlert {
  id: string;
  token: string;
  pair: string;
  alertType: string;
  timeframe: string;
  description: string;
  price: string;
  timestamp: string;
  category: 'market-structure' | 'delta-volume' | 'volatility';
}

export default function OracleAlertsPage() {
  const [alerts, setAlerts] = useState<OracleAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<'all' | 'market-structure' | 'delta-volume' | 'volatility'>('all');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tools/oracle-alerts?filter=${filter}`);

      if (response.ok) {
        const result = await response.json();
        setAlerts(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, filter]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market-structure':
        return 'primary';
      case 'delta-volume':
        return 'info';
      case 'volatility':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market-structure':
        return 'bi-diagram-3';
      case 'delta-volume':
        return 'bi-bar-chart';
      case 'volatility':
        return 'bi-lightning';
      default:
        return 'bi-bell';
    }
  };

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter((alert: OracleAlert) => alert.category === filter);

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
          <li className="breadcrumb-item active" aria-current="page">Oracle Alerts</li>
        </ol>
      </nav>

      {/* Dashboard Header */}
      <div className="card mb-4 bg-dark text-white">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-bell display-6 me-3 text-danger"></i>
            <div>
              <h1 className="h3 mb-1">Oracle Alerts - Live Feed</h1>
              <p className="mb-0 text-light">
                Real-time trading alerts powered by OracleAlgo
              </p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-secondary rounded p-4 text-center" style={{ minHeight: '200px' }}>
            <div className="d-flex align-items-center justify-content-center h-100">
              <div>
                <h2 className="h1">Oracle Algorithm Alerts</h2>
                <p className="mt-3 text-light">
                  Market structure breaks, delta volume signals, and volatility alerts
                </p>
              </div>
            </div>
            <div className="d-flex justify-content-around mt-4 text-light">
              <div><i className="bi bi-diagram-3 me-2"></i>MarketStructure</div>
              <div><i className="bi bi-bar-chart me-2"></i>DeltaVolume</div>
              <div><i className="bi bi-lightning me-2"></i>Volatility</div>
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

      {/* Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="btn-group" role="group">
                <button
                  onClick={() => setFilter('all')}
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                >
                  All Alerts
                </button>
                <button
                  onClick={() => setFilter('market-structure')}
                  className={`btn ${filter === 'market-structure' ? 'btn-primary' : 'btn-outline-primary'}`}
                >
                  Market Structure
                </button>
                <button
                  onClick={() => setFilter('delta-volume')}
                  className={`btn ${filter === 'delta-volume' ? 'btn-info' : 'btn-outline-info'}`}
                >
                  Delta Volume
                </button>
                <button
                  onClick={() => setFilter('volatility')}
                  className={`btn ${filter === 'volatility' ? 'btn-warning' : 'btn-outline-warning'}`}
                >
                  Volatility
                </button>
              </div>
            </div>
            <div className="col-md-4 text-end">
              <div className="form-check form-switch d-inline-block">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoRefreshSwitch"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="autoRefreshSwitch">
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Auto-refresh (30s)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading && alerts.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 mb-0">Loading alerts...</p>
          </div>
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="row g-3">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="col-12">
              <div className={`card border-start border-${getCategoryColor(alert.category)} border-4`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                      <i className={`bi ${getCategoryIcon(alert.category)} text-${getCategoryColor(alert.category)} me-2`}></i>
                      <h6 className="mb-0 fw-bold">{alert.token} {alert.timeframe} {alert.alertType}</h6>
                    </div>
                    <small className="text-muted">{alert.timestamp}</small>
                  </div>

                  <p className="mb-2">{alert.description}</p>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-secondary me-2">{alert.pair}</span>
                      <span className={`badge bg-${getCategoryColor(alert.category)}`}>
                        {alert.category.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-muted">
                      <strong>Price:</strong> {alert.price}
                    </div>
                  </div>

                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Powered by OracleAlgo
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <p className="text-muted mb-0">
              No alerts available. New alerts will appear here automatically.
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="card mt-4">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-lightbulb text-warning me-2"></i>
            Understanding Oracle Alerts
          </h6>
          <div className="row">
            <div className="col-md-4">
              <h6 className="small fw-bold text-primary">
                <i className="bi bi-diagram-3 me-1"></i>
                Market Structure Breaks
              </h6>
              <ul className="small mb-0">
                <li>Bullish/Bearish structure shifts</li>
                <li>Key support/resistance breaks</li>
                <li>Trend reversal signals</li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6 className="small fw-bold text-info">
                <i className="bi bi-bar-chart me-1"></i>
                Delta Volume Signals
              </h6>
              <ul className="small mb-0">
                <li>Buy/sell volume imbalances</li>
                <li>Accumulation/distribution</li>
                <li>Institutional activity</li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6 className="small fw-bold text-warning">
                <i className="bi bi-lightning me-1"></i>
                Volatility Alerts
              </h6>
              <ul className="small mb-0">
                <li>Rapid price movements</li>
                <li>Volume spikes</li>
                <li>Momentum shifts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

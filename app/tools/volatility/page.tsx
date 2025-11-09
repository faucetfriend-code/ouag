'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VolatilityAlert {
  token: string;
  pair: string;
  alertType: string;
  price: string;
  change5m: string;
  ticks5m: string;
  volumeIncrease?: string;
  volume15m?: string;
  timestamp: string;
}

type AlertType = 'bullish' | 'bearish';

export default function VolatilityPage() {
  const [selectedType, setSelectedType] = useState<AlertType>('bullish');
  const [data, setData] = useState<VolatilityAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchData = async (type: AlertType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tools/volatility?type=${type}`);

      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeClick = (type: AlertType) => {
    setSelectedType(type);
    fetchData(type);
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
          <li className="breadcrumb-item active" aria-current="page">Volatility Analysis</li>
        </ol>
      </nav>

      {/* Dashboard Header */}
      <div className="card mb-4 bg-dark text-white">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-bar-chart-line display-6 me-3 text-warning"></i>
            <div>
              <h1 className="h3 mb-1">Volatility Monitor</h1>
              <p className="mb-0 text-light">
                Real-time alerts for significant price movements and volatility spikes
              </p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-secondary rounded p-4 text-center" style={{ minHeight: '200px' }}>
            <div className="d-flex align-items-center justify-content-center h-100">
              <div>
                <h2 className="h1">Volatility Analysis</h2>
                <p className="mt-3 text-light">
                  Track rapid price movements with fast move and big move alerts
                </p>
              </div>
            </div>
            <div className="d-flex justify-content-around mt-4 text-light">
              <div><i className="bi bi-lightning me-2"></i>FastMoveAlerts</div>
              <div><i className="bi bi-exclamation-triangle me-2"></i>BigMoveAlerts</div>
              <div><i className="bi bi-graph-up me-2"></i>VolumeSpikes</div>
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

      {/* Alert Type Selector */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex gap-3 justify-content-center">
            <button
              onClick={() => handleTypeClick('bullish')}
              className={`btn ${
                selectedType === 'bullish' ? 'btn-success' : 'btn-outline-success'
              } px-5 py-3`}
              disabled={loading}
            >
              <i className="bi bi-arrow-up-circle me-2"></i>
              Bullish Volatility
            </button>
            <button
              onClick={() => handleTypeClick('bearish')}
              className={`btn ${
                selectedType === 'bearish' ? 'btn-danger' : 'btn-outline-danger'
              } px-5 py-3`}
              disabled={loading}
            >
              <i className="bi bi-arrow-down-circle me-2"></i>
              Bearish Volatility
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 mb-0">Fetching volatility alerts...</p>
          </div>
        </div>
      ) : data.length > 0 ? (
        <div className="row g-3">
          {data.map((alert, index) => (
            <div key={index} className="col-12">
              <div className={`card border-${selectedType === 'bullish' ? 'success' : 'danger'}`}>
                <div className={`card-header bg-${selectedType === 'bullish' ? 'success' : 'danger'} text-white`}>
                  <h6 className="mb-0">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {alert.token} - {alert.alertType}
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <table className="table table-sm table-borderless mb-0">
                        <tbody>
                          <tr>
                            <td className="text-muted">Price</td>
                            <td className="fw-bold">{alert.price}</td>
                            <td className="text-muted">Change 5m</td>
                            <td className={`fw-bold ${selectedType === 'bullish' ? 'text-success' : 'text-danger'}`}>
                              {alert.change5m}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted">Ticks 5m</td>
                            <td className="fw-bold">{alert.ticks5m}</td>
                            {alert.volumeIncrease && (
                              <>
                                <td className="text-muted">Volume Increase</td>
                                <td className="fw-bold">{alert.volumeIncrease}</td>
                              </>
                            )}
                            {alert.volume15m && (
                              <>
                                <td className="text-muted">Volume 15m</td>
                                <td className="fw-bold">{alert.volume15m}</td>
                              </>
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <div className="bg-dark rounded p-3 text-center" style={{ height: '120px' }}>
                        <i className="bi bi-graph-up display-6 text-muted"></i>
                        <p className="mb-0 small text-light mt-2">Chart visualization</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Volatility Monitor • Powered by OracleAlgo • {alert.timestamp}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {lastUpdate && (
            <div className="col-12">
              <div className="text-center">
                <small className="text-muted">
                  <i className="bi bi-clock me-2"></i>
                  Last update: {lastUpdate}
                </small>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-info-circle display-4 text-muted mb-3"></i>
            <p className="text-muted mb-0">
              Click a button above to view volatility alerts
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="card mt-4">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-lightbulb text-warning me-2"></i>
            Understanding Volatility Alerts
          </h6>
          <ul className="mb-0 small">
            <li><strong>Fast Move Alert:</strong> Rapid price movement in a short timeframe (5m)</li>
            <li><strong>Big Move Alert:</strong> Significant price change with high volume (15m)</li>
            <li><strong>Bullish Volatility:</strong> Sharp upward price movements indicating buying pressure</li>
            <li><strong>Bearish Volatility:</strong> Sharp downward price movements indicating selling pressure</li>
            <li>High volatility can signal trading opportunities or increased risk</li>
            <li>Always confirm alerts with additional technical analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

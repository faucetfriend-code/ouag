'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TokenData {
  token: string;
  price: string;
  change: string;
  timestamp?: string;
}

type TimeFrame = '5m' | '15m' | '1h' | '4h' | '1d';
type DataType = 'gainers' | 'losers';

export default function GainersLosersPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('5m');
  const [selectedType, setSelectedType] = useState<DataType>('gainers');
  const [data, setData] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const timeframes: TimeFrame[] = ['5m', '15m', '1h', '4h', '1d'];

  const fetchData = async (timeframe: TimeFrame, type: DataType) => {
    setLoading(true);
    try {
      // TODO: Replace with actual Discord bot webhook/API endpoint
      const response = await fetch(`/api/tools/gainers-losers?timeframe=${timeframe}&type=${type}`);

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

  const handleTimeframeClick = (timeframe: TimeFrame, type: DataType) => {
    setSelectedTimeframe(timeframe);
    setSelectedType(type);
    fetchData(timeframe, type);
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
          <li className="breadcrumb-item active" aria-current="page">Gainers & Losers</li>
        </ol>
      </nav>

      {/* Dashboard Header */}
      <div className="card mb-4 bg-dark text-white">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-trophy display-6 me-3 text-warning"></i>
            <div>
              <h1 className="h3 mb-1">Top Gainers & Losers Dashboard</h1>
              <p className="mb-0 text-light">
                Click a timeframe below to view the Top Gainers & Losers for USDT perpetual contracts
              </p>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="bg-secondary rounded p-4 text-center" style={{ minHeight: '200px' }}>
            <div className="d-flex align-items-center justify-content-center h-100">
              <div>
                <i className="bi bi-graph-up display-1 text-success me-4"></i>
                <h2 className="h1 d-inline-block">Introducing Our New Tool</h2>
                <i className="bi bi-graph-down display-1 text-danger ms-4"></i>
              </div>
            </div>
            <p className="mt-3 text-light">
              Our dashboard tracks real-time volatility on 5m, 15m, 1h, 4h, and daily timeframes,
              <br />
              helping you spot key cryptocurrencies before the crowd!
            </p>
            <div className="d-flex justify-content-around mt-4 text-light">
              <div><i className="bi bi-clock me-2"></i>15mAutoRefresh</div>
              <div><i className="bi bi-trophy me-2"></i>TopGainers</div>
              <div><i className="bi bi-graph-down me-2"></i>TopLosers</div>
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

      {/* Timeframe Selector */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Top Gainers Buttons */}
            <div className="col-12">
              <h6 className="text-success mb-3">
                <TrendingUp className="me-2" size={20} />
                Top Gainers
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {timeframes.map((tf) => (
                  <button
                    key={`gainers-${tf}`}
                    onClick={() => handleTimeframeClick(tf, 'gainers')}
                    className={`btn ${
                      selectedTimeframe === tf && selectedType === 'gainers'
                        ? 'btn-success'
                        : 'btn-outline-success'
                    } px-4 py-2`}
                    disabled={loading}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Losers Buttons */}
            <div className="col-12">
              <h6 className="text-danger mb-3">
                <TrendingDown className="me-2" size={20} />
                Top Losers
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {timeframes.map((tf) => (
                  <button
                    key={`losers-${tf}`}
                    onClick={() => handleTimeframeClick(tf, 'losers')}
                    className={`btn ${
                      selectedTimeframe === tf && selectedType === 'losers'
                        ? 'btn-danger'
                        : 'btn-outline-danger'
                    } px-4 py-2`}
                    disabled={loading}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
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
            <p className="mt-3 mb-0">Fetching data from Discord bot...</p>
          </div>
        </div>
      ) : data.length > 0 ? (
        <div className="card">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">
              <i className={`bi ${selectedType === 'gainers' ? 'bi-graph-up text-success' : 'bi-graph-down text-danger'} me-2`}></i>
              Top 10 {selectedType === 'gainers' ? 'Gainers' : 'Losers'} ({selectedTimeframe})
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Token</th>
                    <th className="text-end">Price</th>
                    <th className="text-center">Chart</th>
                    <th className="text-end">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{item.token}</td>
                      <td className="text-end">{item.price}</td>
                      <td className="text-center">
                        <i className="bi bi-bar-chart-fill text-muted"></i>
                      </td>
                      <td className={`text-end fw-bold ${
                        selectedType === 'gainers' ? 'text-success' : 'text-danger'
                      }`}>
                        {item.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-light border-top">
              <small className="text-muted">
                <i className="bi bi-clock me-2"></i>
                Updated every 5 minutes • Last update: {lastUpdate}
              </small>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-info-circle display-4 text-muted mb-3"></i>
            <p className="text-muted mb-0">
              Select a timeframe above to view Top Gainers or Losers
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="card mt-4">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-lightbulb text-warning me-2"></i>
            How it works
          </h6>
          <ul className="mb-0 small">
            <li>Click a green button to see the top gaining cryptocurrencies for that timeframe</li>
            <li>Click a red button to see the top losing cryptocurrencies for that timeframe</li>
            <li>Data updates automatically every 5 minutes</li>
            <li>All prices are for USDT perpetual contracts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

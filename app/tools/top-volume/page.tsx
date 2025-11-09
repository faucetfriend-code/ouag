'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface VolumeData {
  token: string;
  price: string;
  volume: string;
  change?: string;
}

type TimeFrame = '5m' | '15m' | '1h' | '4h' | '1d';
type FlowType = 'inflows' | 'outflows';

export default function TopVolumePage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('5m');
  const [selectedFlow, setSelectedFlow] = useState<FlowType>('inflows');
  const [data, setData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const timeframes: TimeFrame[] = ['5m', '15m', '1h', '4h', '1d'];

  const fetchData = async (timeframe: TimeFrame, flow: FlowType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tools/top-volume?timeframe=${timeframe}&flow=${flow}`);

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

  const handleTimeframeClick = (timeframe: TimeFrame, flow: FlowType) => {
    setSelectedTimeframe(timeframe);
    setSelectedFlow(flow);
    fetchData(timeframe, flow);
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
          <li className="breadcrumb-item active" aria-current="page">Top Volume</li>
        </ol>
      </nav>

      {/* Dashboard Header */}
      <div className="card mb-4 bg-dark text-white">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-graph-up display-6 me-3 text-primary"></i>
            <div>
              <h1 className="h3 mb-1">Top Volume Dashboard</h1>
              <p className="mb-0 text-light">
                Click a timeframe below to view the Top Volume coins by price movement
              </p>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="bg-secondary rounded p-4 text-center" style={{ minHeight: '200px' }}>
            <div className="d-flex align-items-center justify-content-center h-100">
              <div>
                <h2 className="h1">Introducing<br />Top Volume Tool</h2>
              </div>
            </div>
            <p className="mt-3 text-light">
              Catch the biggest moves early by monitoring the top volume across major timeframes.
            </p>
            <div className="d-flex justify-content-around mt-4 text-light">
              <div><i className="bi bi-clock me-2"></i>MultiTimeframe</div>
              <div><i className="bi bi-graph-up me-2"></i>TopInflows</div>
              <div><i className="bi bi-graph-down me-2"></i>TopOutflows</div>
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
            {/* Top Inflows Buttons */}
            <div className="col-12">
              <h6 className="text-success mb-3">
                <TrendingUp className="me-2" size={20} />
                Top 10 Inflows
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {timeframes.map((tf) => (
                  <button
                    key={`inflows-${tf}`}
                    onClick={() => handleTimeframeClick(tf, 'inflows')}
                    className={`btn ${
                      selectedTimeframe === tf && selectedFlow === 'inflows'
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

            {/* Top Outflows Buttons */}
            <div className="col-12">
              <h6 className="text-danger mb-3">
                <TrendingDown className="me-2" size={20} />
                Top 10 Outflows
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {timeframes.map((tf) => (
                  <button
                    key={`outflows-${tf}`}
                    onClick={() => handleTimeframeClick(tf, 'outflows')}
                    className={`btn ${
                      selectedTimeframe === tf && selectedFlow === 'outflows'
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
            <p className="mt-3 mb-0">Fetching volume data...</p>
          </div>
        </div>
      ) : data.length > 0 ? (
        <div className="card">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">
              <i className={`bi ${selectedFlow === 'inflows' ? 'bi-arrow-up-circle text-success' : 'bi-arrow-down-circle text-danger'} me-2`}></i>
              Top 10 {selectedFlow === 'inflows' ? 'Inflows' : 'Outflows'} ({selectedTimeframe})
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
                    <th className="text-end">Volume</th>
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
                        selectedFlow === 'inflows' ? 'text-success' : 'text-danger'
                      }`}>
                        {item.volume}
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
              Select a timeframe above to view Top Volume Inflows or Outflows
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
            <li>Click a green button to see the cryptocurrencies with highest volume inflows for that timeframe</li>
            <li>Click a red button to see the cryptocurrencies with highest volume outflows for that timeframe</li>
            <li>High volume can indicate strong market interest and potential price movements</li>
            <li>Data refreshes automatically every 5 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

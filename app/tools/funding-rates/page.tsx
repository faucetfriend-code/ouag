'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FundingRateData {
  token: string;
  exchange: string;
  rate: string;
  nextFunding: string;
  predicted: string;
}

type RateType = 'positive' | 'negative';

export default function FundingRatesPage() {
  const [selectedType, setSelectedType] = useState<RateType>('positive');
  const [data, setData] = useState<FundingRateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchData = async (type: RateType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tools/funding-rates?type=${type}`);

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

  const handleTypeClick = (type: RateType) => {
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
          <li className="breadcrumb-item active" aria-current="page">Funding Rates</li>
        </ol>
      </nav>

      {/* Dashboard Header */}
      <div className="card mb-4 bg-dark text-white">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-cash-stack display-6 me-3 text-info"></i>
            <div>
              <h1 className="h3 mb-1">Funding Rates Dashboard</h1>
              <p className="mb-0 text-light">
                Click a button below to view the top positive or negative funding rates for perpetual contracts
              </p>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="bg-secondary rounded p-4 text-center" style={{ minHeight: '200px' }}>
            <div className="d-flex align-items-center justify-content-center h-100">
              <div>
                <h2 className="h1">Introducing<br />Funding Rate Tool</h2>
              </div>
            </div>
            <p className="mt-3 text-light">
              Stay ahead of the market with real-time funding rate insights across top exchanges.
            </p>
            <div className="d-flex justify-content-around mt-4 text-light">
              <div><i className="bi bi-clock me-2"></i>RealTimeData</div>
              <div><i className="bi bi-graph-up me-2"></i>PositiveRates</div>
              <div><i className="bi bi-graph-down me-2"></i>NegativeRates</div>
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

      {/* Rate Type Selector */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex gap-3 justify-content-center">
            <button
              onClick={() => handleTypeClick('positive')}
              className={`btn ${
                selectedType === 'positive' ? 'btn-success' : 'btn-outline-success'
              } px-5 py-3`}
              disabled={loading}
            >
              <i className="bi bi-arrow-up-circle me-2"></i>
              Top Positive Rates
            </button>
            <button
              onClick={() => handleTypeClick('negative')}
              className={`btn ${
                selectedType === 'negative' ? 'btn-danger' : 'btn-outline-danger'
              } px-5 py-3`}
              disabled={loading}
            >
              <i className="bi bi-arrow-down-circle me-2"></i>
              Top Negative Rates
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
            <p className="mt-3 mb-0">Fetching funding rates...</p>
          </div>
        </div>
      ) : data.length > 0 ? (
        <div className="card">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">
              <i className={`bi ${selectedType === 'positive' ? 'bi-graph-up text-success' : 'bi-graph-down text-danger'} me-2`}></i>
              Top {selectedType === 'positive' ? 'Positive' : 'Negative'} Funding Rates
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="row g-3 p-3">
              {data.map((item, index) => (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-0 fw-bold">{item.token}</h6>
                          <small className="text-muted">{item.exchange}</small>
                        </div>
                        <span className={`badge ${
                          selectedType === 'positive' ? 'bg-success' : 'bg-danger'
                        }`}>
                          {item.rate}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-secondary">
                          <i className="bi bi-clock me-1"></i>
                          Next: {item.nextFunding}
                        </small>
                        <small className="text-muted">
                          Pred: {item.predicted}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-light border-top">
              <small className="text-muted">
                <i className="bi bi-clock me-2"></i>
                Updated every 8 hours • Last update: {lastUpdate}
              </small>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-info-circle display-4 text-muted mb-3"></i>
            <p className="text-muted mb-0">
              Click a button above to view funding rates
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="card mt-4">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-lightbulb text-warning me-2"></i>
            Understanding Funding Rates
          </h6>
          <ul className="mb-0 small">
            <li><strong>Positive rates:</strong> Longs pay shorts (bullish sentiment)</li>
            <li><strong>Negative rates:</strong> Shorts pay longs (bearish sentiment)</li>
            <li>Extreme funding rates can indicate overheated positions and potential reversals</li>
            <li>Funding occurs typically every 8 hours on most exchanges</li>
            <li>Use funding rates to gauge market sentiment and plan entries/exits</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

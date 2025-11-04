/**
 * Airdrops Page
 *
 * Displays active and upcoming cryptocurrency airdrops.
 * TODO: Connect to Airdrop workflow + Redis database
 */

import Link from 'next/link';
import { getActiveAirdrops, getUpcomingAirdrops } from '@/lib/airdropsData';

export default async function AirdropsPage() {
  const activeAirdrops = await getActiveAirdrops();
  const upcomingAirdrops = await getUpcomingAirdrops();

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Airdrop Guide</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-4">
        <h1 className="mb-2">
          <i className="bi bi-gift me-2"></i>
          Airdrop Guide
        </h1>
        <p className="text-secondary mb-0">
          Discover upcoming airdrops, eligibility criteria, and claim instructions
        </p>
        <small className="text-warning d-block mt-2">
          📝 Using mock data - Will connect to airdrop workflow + database
        </small>
      </div>

      {/* Active Airdrops */}
      <div className="mb-5">
        <h3 className="mb-3">
          <span className="badge bg-success">Active</span> Airdrops
        </h3>
        <div className="row g-4">
          {activeAirdrops.map(airdrop => (
            <div key={airdrop.id} className="col-md-6 col-lg-4">
              <div className="card h-100 hover-card border-success">
                <div className="card-body">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{airdrop.project}</h5>
                      <span className="badge bg-primary">{airdrop.tokenSymbol}</span>
                    </div>
                    {airdrop.verified && (
                      <i className="bi bi-check-circle-fill text-success" title="Verified"></i>
                    )}
                  </div>

                  {/* Description */}
                  <p className="card-text text-secondary small mb-3">
                    {airdrop.description}
                  </p>

                  {/* Value & Type */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <small className="text-muted">Total Value:</small>
                      <strong className="text-warning">{airdrop.totalValue}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <small className="text-muted">Type:</small>
                      <span className="badge bg-info text-dark">{airdrop.type}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">Est. Reward:</small>
                      <strong className="text-success">{airdrop.estimatedReward}</strong>
                    </div>
                  </div>

                  {/* Requirements Preview */}
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Requirements:</small>
                    <ul className="small mb-0 ps-3">
                      {airdrop.requirements.slice(0, 2).map((req, i) => (
                        <li key={i} className="text-secondary">{req}</li>
                      ))}
                      {airdrop.requirements.length > 2 && (
                        <li className="text-muted">+{airdrop.requirements.length - 2} more...</li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="d-grid">
                    <a href={airdrop.website} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm">
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Airdrops */}
      <div>
        <h3 className="mb-3">
          <span className="badge bg-warning text-dark">Upcoming</span> Airdrops
        </h3>
        <div className="row g-4">
          {upcomingAirdrops.map(airdrop => (
            <div key={airdrop.id} className="col-md-6 col-lg-4">
              <div className="card h-100 hover-card border-warning">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{airdrop.project}</h5>
                      <span className="badge bg-primary">{airdrop.tokenSymbol}</span>
                    </div>
                    {airdrop.verified && (
                      <i className="bi bi-check-circle-fill text-success" title="Verified"></i>
                    )}
                  </div>

                  <p className="card-text text-secondary small mb-3">
                    {airdrop.description}
                  </p>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <small className="text-muted">Total Value:</small>
                      <strong className="text-warning">{airdrop.totalValue}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <small className="text-muted">Start Date:</small>
                      <small>{airdrop.startDate.toLocaleDateString()}</small>
                    </div>
                  </div>

                  <div className="d-grid">
                    <a href={airdrop.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline-warning btn-sm">
                      <i className="bi bi-calendar-check me-1"></i>
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="text-center">
            <small className="text-secondary">
              Check out{' '}
              <Link href="/news" className="text-primary text-decoration-none">
                latest news
              </Link>{' '}or{' '}
              <Link href="/tools" className="text-success text-decoration-none">
                trading tools
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

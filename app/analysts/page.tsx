/**
 * Analysts Directory Page
 *
 * Displays a searchable list of all analysts with their profiles
 * Shows analyst stats, tokens they cover, and links to their profiles
 */

import Link from 'next/link';
import { getTradingPostsByToken, getAllTokens } from '@/lib/analystDataSource';

interface AnalystProfile {
  username: string;
  totalPosts: number;
  tokensCovered: string[];
  latestPostDate: Date;
}

async function getAllAnalysts(): Promise<AnalystProfile[]> {
  const tokens = await getAllTokens();

  // Fetch all posts
  const allPosts = await Promise.all(
    tokens.map(token => getTradingPostsByToken(token))
  ).then(results => results.flat());

  // Group by analyst
  const analystMap = new Map<string, AnalystProfile>();

  allPosts.forEach(post => {
    const username = post.user;

    if (!analystMap.has(username)) {
      analystMap.set(username, {
        username,
        totalPosts: 0,
        tokensCovered: [],
        latestPostDate: new Date(post.timestamp)
      });
    }

    const profile = analystMap.get(username)!;
    profile.totalPosts++;

    if (!profile.tokensCovered.includes(post.token)) {
      profile.tokensCovered.push(post.token);
    }

    const postDate = new Date(post.timestamp);
    if (postDate > profile.latestPostDate) {
      profile.latestPostDate = postDate;
    }
  });

  // Convert to array and sort by total posts (most active first)
  return Array.from(analystMap.values()).sort((a, b) => b.totalPosts - a.totalPosts);
}

export default async function AnalystsDirectoryPage() {
  const analysts = await getAllAnalysts();

  // Calculate current time for "time ago" formatting
  const now = Date.now();

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((now - date.getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    return `${months} months ago`;
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Analysts
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-4">
        <h1 className="mb-2">
          <i className="bi bi-people me-2"></i>
          Analyst Directory
        </h1>
        <p className="text-secondary mb-0">
          Browse all analysts and their analysis coverage
        </p>
      </div>

      {/* Stats Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">{analysts.length}</h3>
              <small className="text-secondary">Total Analysts</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success mb-1">
                {analysts.reduce((sum, a) => sum + a.totalPosts, 0)}
              </h3>
              <small className="text-secondary">Total Posts</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info mb-1">
                {analysts.length > 0 ? Math.round(analysts.reduce((sum, a) => sum + a.totalPosts, 0) / analysts.length) : 0}
              </h3>
              <small className="text-secondary">Avg Posts per Analyst</small>
            </div>
          </div>
        </div>
      </div>

      {/* Analysts List */}
      <div className="row g-4">
        {analysts.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center text-secondary">
                <i className="bi bi-inbox display-4 mb-3"></i>
                <p>No analysts found. Check back later!</p>
              </div>
            </div>
          </div>
        ) : (
          analysts.map((analyst) => (
            <div key={analyst.username} className="col-md-6 col-lg-4">
              <Link
                href={`/profile/analyst/${analyst.username}`}
                className="text-decoration-none"
              >
                <div className="card h-100 hover-card">
                  <div className="card-body">
                    {/* Analyst Header */}
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: '50px', height: '50px', fontSize: '1.5rem', fontWeight: 'bold' }}
                      >
                        {analyst.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="mb-0">@{analyst.username}</h5>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          Active {formatTimeAgo(analyst.latestPostDate)}
                        </small>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <div className="text-center p-2 bg-light rounded">
                          <small className="text-secondary d-block">Posts</small>
                          <span className="fw-bold">{analyst.totalPosts}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-center p-2 bg-light rounded">
                          <small className="text-secondary d-block">Tokens</small>
                          <span className="fw-bold">{analyst.tokensCovered.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tokens Covered */}
                    <div className="mb-3">
                      <small className="text-secondary d-block mb-2">Covers:</small>
                      <div className="d-flex flex-wrap gap-1">
                        {analyst.tokensCovered.slice(0, 5).map(token => (
                          <span key={token} className="badge bg-secondary">
                            {token}
                          </span>
                        ))}
                        {analyst.tokensCovered.length > 5 && (
                          <span className="badge bg-light text-dark">
                            +{analyst.tokensCovered.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <div className="text-center">
                      <span className="btn btn-outline-primary btn-sm w-100">
                        <i className="bi bi-person me-1"></i>
                        View Profile
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Additional Links */}
      <div className="text-center mt-4">
        <p className="text-secondary">
          Looking for token-specific insights?{' '}
          <Link href="/insights" className="text-primary text-decoration-none">
            View Analyst Insights by Token
          </Link>
        </p>
      </div>
    </div>
  );
}

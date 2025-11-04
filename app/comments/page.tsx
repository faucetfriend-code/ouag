/**
 * Analyst Comments Page
 *
 * Displays all analyst comments from all tokens in chronological order (newest first).
 * Provides a comprehensive view of real-time market sentiment across the entire platform.
 */

import Link from 'next/link';
import { getAllTokens, getTradingPostsByToken } from '../../lib/analystDataSource';
import { TradingPost } from '../../data/mockData';

// Mock price data for demonstration
const mockPriceData: Record<string, { price: number; change1h: number; change24h: number }> = {
  BTC: { price: 58750, change1h: 0.85, change24h: 2.34 },
  ETH: { price: 1950, change1h: -0.23, change24h: 1.67 },
  ADA: { price: 0.42, change1h: 1.12, change24h: -0.89 },
  SOL: { price: 29.80, change1h: 2.45, change24h: 4.21 },
  DOGE: { price: 0.078, change1h: -1.23, change24h: 3.45 },
  LINK: { price: 9.20, change1h: 0.67, change24h: -1.12 },
  UNI: { price: 5.40, change1h: 1.89, change24h: 2.78 },
  AVAX: { price: 14.60, change1h: -0.45, change24h: 1.23 },
  MATIC: { price: 0.98, change1h: 0.34, change24h: -0.67 },
  DOT: { price: 5.60, change1h: 1.56, change24h: 2.89 }
};

export default async function AnalystCommentsPage() {
  // Get all tokens
  const tokens = await getAllTokens();

  // Fetch posts for all tokens in parallel
  const postsPromises = tokens.map(token => getTradingPostsByToken(token));
  const postsArrays = await Promise.all(postsPromises);

  // Flatten all posts into a single array
  const allPosts: TradingPost[] = postsArrays.flat();

  // Sort posts by timestamp in descending order (newest first)
  const chronologicalPosts = allPosts.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Format price display
  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  // Get color for token badges
  const getTokenColor = (token: string) => {
    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];
    const index = token.charCodeAt(0) % colors.length;
    return colors[index];
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
            Analyst Comments
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-2">
            <i className="bi bi-chat-quote me-2 text-info"></i>
            Analyst Comments
          </h1>
          <p className="text-secondary mb-0">
            Real-time market sentiment from all analysts across all tokens
          </p>
        </div>
        <div className="text-end">
          <div className="h4 mb-0">{allPosts.length}</div>
          <small className="text-secondary">Total Comments</small>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-primary mb-1">{tokens.length}</h4>
                    <small className="text-secondary">Tokens Tracked</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-success mb-1">
                      {new Set(allPosts.map(p => p.user)).size}
                    </h4>
                    <small className="text-secondary">Active Analysts</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-info mb-1">{allPosts.length}</h4>
                    <small className="text-secondary">Total Comments</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3">
                    <h4 className="text-warning mb-1">
                      {chronologicalPosts.length > 0 ?
                        chronologicalPosts[0].timestamp.toLocaleDateString() :
                        'No data'}
                    </h4>
                    <small className="text-secondary">Latest Comment</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Comments Timeline */}
      <div className="row">
        <div className="col-12">
          {chronologicalPosts.length === 0 ? (
            <div className="card">
              <div className="card-body text-center text-secondary">
                <i className="bi bi-chat-dots display-4 mb-3"></i>
                <p>No analyst comments available.</p>
              </div>
            </div>
          ) : (
            <div className="timeline">
              {chronologicalPosts.map((post: TradingPost, index: number) => {
                const priceData = mockPriceData[post.token];
                return (
                  <div key={`${post.id}-${index}`} className="timeline-item mb-4">
                    <div className={`timeline-marker bg-${getTokenColor(post.token)}`}></div>
                    <div className="timeline-content">
                      <div className="card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <Link
                              href={`/profile/analyst/${post.user}`}
                              className="text-decoration-none text-primary fw-bold me-3"
                            >
                              <i className="bi bi-person-circle me-2"></i>
                              {post.user}
                            </Link>
                            <span className="badge bg-secondary me-2">#{post.channel}</span>
                            <Link
                              href={`/analysts/${post.token.toLowerCase()}`}
                              className="text-decoration-none"
                            >
                              <span className={`badge bg-${getTokenColor(post.token)}`}>
                                {post.token}
                                {priceData && (
                                  <span className="ms-1 small">
                                    {formatPrice(priceData.price)}
                                  </span>
                                )}
                              </span>
                            </Link>
                          </div>
                          <div className="text-end">
                            <small className="text-secondary">
                              {post.timestamp.toLocaleDateString()} {post.timestamp.toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-12">
                              <p className="mb-2 analyst-quote">{post.content}</p>
                              {post.analysis && (
                                <div className="alert alert-info py-2 px-3 mb-2">
                                  <small className="analyst-quote">
                                    <strong>Analysis:</strong> {post.analysis}
                                  </small>
                                </div>
                              )}
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-secondary">
                                  Posted about {post.token}
                                </small>
                                <Link
                                  href={`/analysts/${post.token.toLowerCase()}/posts`}
                                  className="btn btn-outline-primary btn-sm"
                                >
                                  <i className="bi bi-arrow-right me-1"></i>
                                  View {post.token} Comments
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="card-title mb-3">Explore More</h6>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link href="/analysts" className="btn btn-primary">
                  <i className="bi bi-bar-chart me-2"></i>
                  Browse by Token
                </Link>
                <Link href="/tools" className="btn btn-success">
                  <i className="bi bi-tools me-2"></i>
                  Trading Tools
                </Link>
                <Link href="/news" className="btn btn-info">
                  <i className="bi bi-newspaper me-2"></i>
                  Latest News
                </Link>
                <Link href="/" className="btn btn-outline-secondary">
                  <i className="bi bi-house me-2"></i>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
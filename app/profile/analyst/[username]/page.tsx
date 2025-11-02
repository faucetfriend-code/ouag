/**
 * Analyst Profile Page
 *
 * Displays detailed information about a specific analyst including:
 * - Profile information (username, avatar, bio)
 * - Favorite/follow button
 * - Most recent post for each token they cover
 * - Analyst statistics
 */

import Link from 'next/link';
import { getTradingPostsByToken, getAllTokens } from '@/lib/analystDataSource';
import { getAnalystFollowerCount } from '@/lib/serverUserPreferences';
import FavoriteAnalystButton from '@/components/FavoriteAnalystButton';

interface AnalystProfilePageProps {
  params: {
    username: string;
  };
}

// Extract analyst-specific data
async function getAnalystData(username: string) {
  const tokens = await getAllTokens();

  // Fetch all posts
  const allPosts = await Promise.all(
    tokens.map(token => getTradingPostsByToken(token))
  ).then(results => results.flat());

  // Filter posts by this analyst
  const analystPosts = allPosts.filter(post => post.user === username);

  // Get tokens this analyst covers
  const tokensCorved = [...new Set(analystPosts.map(post => post.token))];

  // Get most recent post per token
  const recentPostsByToken = tokensCorved.map(token => {
    const tokenPosts = analystPosts.filter(p => p.token === token);
    // Sort by timestamp descending
    tokenPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return {
      token,
      post: tokenPosts[0]
    };
  });

  // Calculate stats
  const stats = {
    totalPosts: analystPosts.length,
    tokensTracked: tokensCorved.length,
    firstPost: analystPosts.length > 0
      ? new Date(Math.min(...analystPosts.map(p => new Date(p.timestamp).getTime())))
      : new Date(),
  };

  return {
    username,
    posts: analystPosts,
    recentPostsByToken,
    stats,
  };
}

export default async function AnalystProfilePage({ params }: AnalystProfilePageProps) {
  const { username } = params;
  const analystData = await getAnalystData(username);
  const followerCount = await getAnalystFollowerCount(username);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
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

  // Get first letter for avatar
  const avatarLetter = username.charAt(0).toUpperCase();

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/analysts" className="text-decoration-none">Analysts</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            @{username}
          </li>
        </ol>
      </nav>

      {/* Analyst Header */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <div className="d-flex align-items-center mb-3">
                {/* Avatar */}
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}>
                  {avatarLetter}
                </div>
                <div>
                  <h2 className="mb-1">@{username}</h2>
                  <p className="text-secondary mb-0">
                    <i className="bi bi-people me-2"></i>
                    {followerCount} follower{followerCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-muted small mb-0">
                    <i className="bi bi-calendar me-1"></i>
                    Joined {formatTimeAgo(analystData.stats.firstPost)}
                  </p>
                </div>
              </div>
              <p className="text-secondary">
                Crypto analyst specializing in {analystData.stats.tokensTracked} token{analystData.stats.tokensTracked !== 1 ? 's' : ''}.
                Providing technical and fundamental analysis across multiple cryptocurrencies.
              </p>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-end">
              <FavoriteAnalystButton username={username} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">{analystData.stats.totalPosts}</h3>
              <small className="text-secondary">Total Posts</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success mb-1">{analystData.stats.tokensTracked}</h3>
              <small className="text-secondary">Tokens Covered</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info mb-1">{followerCount}</h3>
              <small className="text-secondary">Followers</small>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts by Token */}
      <div className="mb-4">
        <h4 className="mb-3">
          <i className="bi bi-file-text me-2"></i>
          Recent Analysis by Token
        </h4>
        {analystData.recentPostsByToken.length === 0 ? (
          <div className="card">
            <div className="card-body text-center text-secondary">
              <i className="bi bi-inbox display-4 mb-3"></i>
              <p>No posts found for this analyst.</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {analystData.recentPostsByToken.map(({ token, post }) => (
              <div key={token} className="col-md-6 col-lg-4">
                <div className="card h-100 hover-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title token-name mb-0">{token}</h5>
                      <span className="badge bg-primary">{token}</span>
                    </div>
                    <small className="text-muted d-block mb-2">
                      <i className="bi bi-clock me-1"></i>
                      {formatTimeAgo(post.timestamp)}
                    </small>
                    <p className="card-text text-secondary small mb-3">
                      {post.content.length > 150
                        ? `${post.content.substring(0, 150)}...`
                        : post.content}
                    </p>
                    {post.analysis && (
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Analysis:</small>
                        <p className="small text-secondary mb-0">
                          {post.analysis.length > 100
                            ? `${post.analysis.substring(0, 100)}...`
                            : post.analysis}
                        </p>
                      </div>
                    )}
                     <Link
                       href={`/analysts/${token.toLowerCase()}/posts`}
                       className="btn btn-outline-primary btn-sm w-100"
                     >
                       <i className="bi bi-arrow-right me-1"></i>
                       View All {token} Posts
                     </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Posts Link */}
      <div className="text-center mt-4">
        <Link href="/analysts" className="btn btn-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to All Analysts
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTradingPostsByToken, getAllTokens } from '../../../../lib/analystDataSource';
import { TradingPost } from '../../../../data/mockData';

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

interface TokenPostsPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function TokenPostsPage({ params }: TokenPostsPageProps) {
  const { token } = await params;

  // Convert token to uppercase for consistency
  const tokenUpper = token.toUpperCase();

  // Get tokens list
  const tokens = await getAllTokens();

  // Validate token exists
  if (!tokens.includes(tokenUpper)) {
    notFound();
  }

  // Fetch posts for this token
  const tokenPosts = await getTradingPostsByToken(tokenUpper);
  const priceData = mockPriceData[tokenUpper];

  // Sort posts by timestamp in descending order (newest first)
  const sortedPosts = tokenPosts.sort((a: TradingPost, b: TradingPost) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getPriceClass = (change: number) => {
    if (change > 0) return 'price-positive';
    if (change < 0) return 'price-negative';
    return 'price-neutral';
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/analysts" className="text-decoration-none">Analysts</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={`/analysts/${token}`} className="text-decoration-none">{tokenUpper}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Posts
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex gap-2 mb-2">
            <Link href={`/analysts/${token}`} className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Analysis
            </Link>
            <Link href={`/analysts/${token}/summary`} className="btn btn-primary btn-sm">
              <i className="bi bi-bar-chart me-2"></i>
              View Summary
            </Link>
          </div>
          <h1 className="mb-2"><span className="token-name">{tokenUpper}</span> Posts</h1>
          <p className="text-secondary mb-0">All analyst posts in chronological order</p>
        </div>
        <div className="text-end">
          <div className="h4 mb-0">{formatPrice(priceData.price)}</div>
          <small className={`fw-bold ${getPriceClass(priceData.change24h)}`}>
            {formatChange(priceData.change24h)} (24h)
          </small>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="p-3">
                    <h4 className="text-primary mb-1">{tokenPosts.length}</h4>
                    <small className="text-secondary">Total Posts</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <h4 className="text-success mb-1">
                      {new Set(tokenPosts.map(p => p.user)).size}
                    </h4>
                    <small className="text-secondary">Active Analysts</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <h4 className="text-info mb-1">
                      {tokenPosts.length > 0 ?
                        new Date(Math.max(...tokenPosts.map((p: TradingPost) => p.timestamp.getTime()))).toLocaleDateString() :
                        'No data'}
                    </h4>
                    <small className="text-secondary">Latest Post</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Posts Feed */}
      <div className="row">
        <div className="col-12">
          {sortedPosts.length === 0 ? (
            <div className="card">
              <div className="card-body text-center text-secondary">
                <i className="bi bi-inbox display-4 mb-3"></i>
                <p>No posts found for {tokenUpper}.</p>
              </div>
            </div>
          ) : (
            <div className="timeline">
              {sortedPosts.map((post: TradingPost, index: number) => (
                <div key={post.id} className="timeline-item mb-4">
                  <div className="card">
                    <div className="card-header bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Link
                            href={`/profile/analyst/${post.user}`}
                            className="text-decoration-none text-primary fw-bold me-3"
                          >
                            <i className="bi bi-person-circle me-2"></i>
                            {post.user}
                          </Link>
                          <span className="badge bg-secondary">#{post.channel}</span>
                        </div>
                        <div className="text-end">
                          <small className="text-secondary">
                            {post.timestamp.toLocaleDateString()} {post.timestamp.toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12">
                          <p className="mb-3 analyst-quote">{post.content}</p>
                          {post.analysis && (
                            <div className="alert alert-info py-2 px-3">
                              <small className="analyst-quote">
                                <strong>Analysis:</strong> {post.analysis}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              <div className="d-flex justify-content-center gap-3">
                <Link href={`/analysts/${token}`} className="btn btn-primary">
                  <i className="bi bi-graph-up me-2"></i>
                  Grouped Analysis
                </Link>
                <Link href={`/analysts/${token}/summary`} className="btn btn-success">
                  <i className="bi bi-bar-chart me-2"></i>
                  Sentiment Summary
                </Link>
                <Link href="/analysts" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  All Tokens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all tokens
export async function generateStaticParams() {
  const allTokens = await getAllTokens();
  return allTokens.map((token: string) => ({
    token: token.toLowerCase(),
  }));
}
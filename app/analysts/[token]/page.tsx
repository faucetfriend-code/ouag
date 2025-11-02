import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTradingPostsByToken, getAllTokens } from '../../../lib/analystDataSource';
import { organizeDataByToken } from '../../../utils/dataOrganization';
import TokenCard from '../../../components/TokenCard';

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

interface TokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function TokenAnalysisPage({ params }: TokenPageProps) {
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

  // Group posts by analyst
  const postsByAnalyst = tokenPosts.reduce((acc, post) => {
    if (!acc[post.user]) {
      acc[post.user] = [];
    }
    acc[post.user].push(post);
    return acc;
  }, {} as Record<string, typeof tokenPosts>);

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
          <li className="breadcrumb-item active" aria-current="page">
            {tokenUpper}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex gap-2 mb-2">
            <Link href="/analysts" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Analysts
            </Link>
            <Link href={`/analysts/${token}/summary`} className="btn btn-primary btn-sm">
              <i className="bi bi-bar-chart me-2"></i>
              View Summary
            </Link>
          </div>
          <h1 className="mb-2"><span className="token-name">{tokenUpper}</span> Analysis</h1>
          <p className="text-secondary mb-0">Comprehensive analyst insights and technical analysis</p>
        </div>
        <div className="text-end">
          <div className="h4 mb-0">{formatPrice(priceData.price)}</div>
          <small className={`fw-bold ${getPriceClass(priceData.change24h)}`}>
            {formatChange(priceData.change24h)} (24h)
          </small>
        </div>
      </div>

      {/* Price Overview */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
               <h5 className="card-title price-overview-text">Price Overview</h5>
               <div className="row">
                 <div className="col-md-4">
                   <div className="text-center p-3 bg-light rounded">
                      <h6 className="text-secondary mb-1">Current Price</h6>
                     <div className={`h5 mb-0 ${getPriceClass(priceData.change24h)}`}>{formatPrice(priceData.price)}</div>
                   </div>
                 </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                     <h6 className="text-secondary mb-1">1 Hour Change</h6>
                    <div className={`h5 mb-0 ${getPriceClass(priceData.change1h)}`}>
                      {formatChange(priceData.change1h)}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                     <h6 className="text-secondary mb-1">24 Hour Change</h6>
                    <div className={`h5 mb-0 ${getPriceClass(priceData.change24h)}`}>
                      {formatChange(priceData.change24h)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
             <div className="card">
               <div className="card-body">
               <h6 className="card-title" style={{ color: 'white' }}>Analysis Summary</h6>
              <div className="mb-2">
                 <small className="text-secondary">Total Posts:</small>
                <span className="float-end fw-bold">{tokenPosts.length}</span>
              </div>
              <div className="mb-2">
                 <small className="text-secondary">Active Analysts:</small>
                <span className="float-end fw-bold">{Object.keys(postsByAnalyst).length}</span>
              </div>
              <div className="mb-0">
                 <small className="text-secondary">Latest Update:</small>
                 <div className="small text-secondary">
                  {tokenPosts.length > 0 ?
                    new Date(Math.max(...tokenPosts.map(p => p.timestamp.getTime()))).toLocaleDateString() :
                    'No data'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyst Analysis */}
      <div className="row">
        {Object.entries(postsByAnalyst).map(([analyst, posts]) => (
          <div key={analyst} className="col-12 mb-4">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  {analyst}
                   <small className="text-secondary ms-2">({posts.length} post{posts.length !== 1 ? 's' : ''})</small>
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {posts.map((post) => (
                    <div key={post.id} className="col-md-6 mb-3">
                      <div className="border rounded p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                           <small className="text-secondary">#{post.channel}</small>
                           <small className="text-secondary">
                            {post.timestamp.toLocaleDateString()} {post.timestamp.toLocaleTimeString()}
                          </small>
                        </div>
                         <p className="mb-2 analyst-quote">{post.content}</p>
                         {post.analysis && (
                           <div className="alert alert-info py-2 px-3 mb-0">
                             <small className="analyst-quote"><strong>Analysis:</strong> {post.analysis}</small>
                           </div>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Combined Chart Section */}
      {tokenPosts.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Combined Analyst Charts</h5>
              </div>
              <div className="card-body">
                <TokenCard token={tokenUpper} posts={tokenPosts} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Generate static params for all tokens
export async function generateStaticParams() {
  const allTokens = await getAllTokens();
  return allTokens.map((token) => ({
    token: token.toLowerCase(),
  }));
}
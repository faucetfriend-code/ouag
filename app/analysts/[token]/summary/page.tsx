import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockTradingPosts, tokens } from '../../../../data/mockData';
import { organizeDataByToken } from '../../../../utils/dataOrganization';

interface TokenSummaryPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function TokenSummaryPage({ params }: TokenSummaryPageProps) {
  const { token } = await params;

  // Validate token exists
  if (!tokens.includes(token.toUpperCase())) {
    notFound();
  }

  const organizedData = organizeDataByToken(mockTradingPosts);
  const tokenPosts = organizedData[token.toUpperCase()] || [];

  // Group posts by analyst and analyze their sentiment/content
  const analystSummaries = tokenPosts.reduce((acc, post) => {
    const analyst = post.user;
    if (!acc[analyst]) {
      acc[analyst] = {
        posts: [],
        totalPosts: 0,
        bullishCount: 0,
        bearishCount: 0,
        neutralCount: 0,
        keyPoints: [],
        latestPost: post.timestamp
      };
    }

    acc[analyst].posts.push(post);
    acc[analyst].totalPosts++;

    // Analyze sentiment from analysis text
    if (post.analysis) {
      const analysis = post.analysis.toLowerCase();
      if (analysis.includes('bullish') || analysis.includes('buy') || analysis.includes('long')) {
        acc[analyst].bullishCount++;
      } else if (analysis.includes('bearish') || analysis.includes('sell') || analysis.includes('short')) {
        acc[analyst].bearishCount++;
      } else {
        acc[analyst].neutralCount++;
      }

      // Extract key points (first sentence or key phrases)
      const sentences = post.analysis.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length > 0) {
        acc[analyst].keyPoints.push(sentences[0].trim());
      }
    }

    // Update latest post date
    if (post.timestamp > acc[analyst].latestPost) {
      acc[analyst].latestPost = post.timestamp;
    }

    return acc;
  }, {} as Record<string, {
    posts: typeof tokenPosts;
    totalPosts: number;
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
    keyPoints: string[];
    latestPost: Date;
  }>);

  // Calculate overall sentiment for each analyst
  const getOverallSentiment = (analyst: any) => {
    const { bullishCount, bearishCount, neutralCount } = analyst;
    if (bullishCount > bearishCount && bullishCount > neutralCount) return 'bullish';
    if (bearishCount > bullishCount && bearishCount > neutralCount) return 'bearish';
    return 'neutral';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-warning';
      case 'bearish': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-warning text-dark';
      case 'bearish': return 'bg-danger';
      default: return 'bg-secondary';
    }
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
            <Link href={`/analysts/${token}`} className="text-decoration-none">{token.toUpperCase()}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Summary
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link href={`/analysts/${token}`} className="btn btn-outline-secondary btn-sm mb-2">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Analysis
          </Link>
          <h1 className="mb-2">{token.toUpperCase()} Analyst Summary</h1>
          <p className="text-muted mb-0">What each analyst has said most about {token.toUpperCase()}</p>
        </div>
        <div className="text-end">
          <div className="h4 mb-0">{Object.keys(analystSummaries).length}</div>
          <small className="text-muted">Active Analysts</small>
        </div>
      </div>

      {/* Overall Market Sentiment */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card glow-orange">
            <div className="card-body">
              <h5 className="card-title text-center mb-3">
                <i className="bi bi-graph-up me-2"></i>
                Overall Market Sentiment
              </h5>
              <div className="row text-center">
                {Object.entries(analystSummaries).map(([analyst, data]) => {
                  const sentiment = getOverallSentiment(data);
                  return (
                    <div key={analyst} className="col-md-3 mb-3">
                      <div className="p-3 bg-dark rounded">
                        <h6 className="mb-2">{analyst}</h6>
                        <span className={`badge ${getSentimentBadge(sentiment)} mb-2`}>
                          {sentiment.toUpperCase()}
                        </span>
                        <div className="small text-muted">
                          {data.bullishCount} Bullish • {data.bearishCount} Bearish • {data.neutralCount} Neutral
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyst Details */}
      <div className="row">
        {Object.entries(analystSummaries).map(([analyst, data]) => {
          const sentiment = getOverallSentiment(data);
          return (
            <div key={analyst} className="col-12 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    {analyst}
                  </h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${getSentimentBadge(sentiment)}`}>
                      {sentiment.toUpperCase()}
                    </span>
                    <small className="text-muted">
                      {data.totalPosts} post{data.totalPosts !== 1 ? 's' : ''}
                    </small>
                  </div>
                </div>
                <div className="card-body">
                  {/* Sentiment Breakdown */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <div className={`h4 mb-1 ${getSentimentColor('bullish')}`}>
                          {data.bullishCount}
                        </div>
                        <small className="text-muted">Bullish Signals</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <div className={`h4 mb-1 ${getSentimentColor('bearish')}`}>
                          {data.bearishCount}
                        </div>
                        <small className="text-muted">Bearish Signals</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <div className={`h4 mb-1 ${getSentimentColor('neutral')}`}>
                          {data.neutralCount}
                        </div>
                        <small className="text-muted">Neutral Signals</small>
                      </div>
                    </div>
                  </div>

                  {/* Key Points */}
                  {data.keyPoints.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-warning mb-3">
                        <i className="bi bi-lightbulb me-2"></i>
                        Key Analysis Points
                      </h6>
                      <div className="row">
                        {data.keyPoints.slice(0, 3).map((point, index) => (
                          <div key={index} className="col-md-4 mb-2">
                            <div className="alert alert-info py-2 px-3">
                              <small>{point}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Latest post: {data.latestPost.toLocaleDateString()}
                      </small>
                      <Link
                        href={`/analysts/${token}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Full Analysis
                        <i className="bi bi-arrow-right ms-2"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="card-title mb-3">Quick Actions</h6>
              <div className="d-flex justify-content-center gap-3">
                <Link href={`/analysts/${token}`} className="btn btn-primary">
                  <i className="bi bi-graph-up me-2"></i>
                  View Charts
                </Link>
                <Link href="/analysts" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  All Tokens
                </Link>
                <Link href="/tools" className="btn btn-success">
                  <i className="bi bi-tools me-2"></i>
                  Trading Tools
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
  return tokens.map((token) => ({
    token: token.toLowerCase(),
  }));
}
 import Link from 'next/link';
 import { notFound } from 'next/navigation';
import { getTradingPostsByToken, getAllTokens } from '../../../../lib/analystDataSource';
import { organizeDataByToken } from '../../../../utils/dataOrganization';

interface TokenSummaryPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function TokenSummaryPage({ params }: TokenSummaryPageProps) {
  // Extract token parameter from URL
  const { token } = await params;

  // Convert token to uppercase for consistent data access
  const tokenUpper = token.toUpperCase();

  // Get tokens list and validate
  const tokens = await getAllTokens();
  if (!tokens.includes(tokenUpper)) {
    notFound();
  }

  // Get trading posts for this specific token
  const tokenPosts = await getTradingPostsByToken(tokenUpper);

  /**
   * ANALYST DATA PROCESSING
   * Group posts by analyst and perform sentiment analysis on their content
   */
  const analystSummaries = tokenPosts.reduce((acc, post) => {
    const analyst = post.user;

    // Initialize analyst data structure if this is their first post
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

    // Add post to analyst's collection
    acc[analyst].posts.push(post);
    acc[analyst].totalPosts++;

    // Perform sentiment analysis on the analysis text
    if (post.analysis) {
      const analysis = post.analysis.toLowerCase();

      // Define keyword lists for sentiment detection
      const bullishKeywords = [
        'bullish', 'buy', 'long', 'positive', 'breakout', 'target', 'accumulation',
        'strong buying', 'oversold', 'bullish for', 'positive for', 'breakout likely',
        'crossover bullish', 'whale activity', 'fibonacci extension', 'macd crossover',
        'strong support', 'accumulation phase', 'etf inflows', 'institutional demand'
      ];

      const bearishKeywords = [
        'bearish', 'sell', 'short', 'caution', 'reversal', 'risk-off', 'rotation',
        'altcoin momentum', 'decreasing', 'watch for altcoin', 'rotation out of',
        'bearish divergence', 'potential reversal', 'stop loss'
      ];

      // Check for bullish and bearish signals
      const isBullish = bullishKeywords.some(keyword => analysis.includes(keyword));
      const isBearish = bearishKeywords.some(keyword => analysis.includes(keyword));

      // Categorize sentiment based on keyword matches
      if (isBullish && !isBearish) {
        acc[analyst].bullishCount++;
      } else if (isBearish && !isBullish) {
        acc[analyst].bearishCount++;
      } else {
        // Mixed signals or no clear sentiment = neutral
        acc[analyst].neutralCount++;
      }

      // Extract key insights from the analysis text
      const sentences = post.analysis.split(/[.!?]+/).filter(s => s.trim().length > 10);

      // Priority: Look for price targets (e.g., "$58k", "$62k")
      const priceTargetMatch = post.analysis.match(/\$[\d,]+k?|\d+k?\s*target/i);
      if (priceTargetMatch) {
        acc[analyst].keyPoints.push(`Price target: ${priceTargetMatch[0]}`);
      } else if (sentences.length > 0) {
        // Fallback: Use first meaningful sentence (truncated if too long)
        const firstSentence = sentences[0].trim();
        acc[analyst].keyPoints.push(
          firstSentence.length > 80
            ? firstSentence.substring(0, 77) + '...'
            : firstSentence
        );
      }
    }

    // Track the most recent post date for this analyst
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

  /**
   * SENTIMENT ANALYSIS HELPERS
   */

  // Determine overall sentiment for an individual analyst
  const getOverallSentiment = (analyst: any) => {
    const { bullishCount, bearishCount, neutralCount } = analyst;
    if (bullishCount > bearishCount && bullishCount > neutralCount) return 'bullish';
    if (bearishCount > bullishCount && bearishCount > neutralCount) return 'bearish';
    return 'neutral';
  };

  // Calculate aggregate sentiment across all analysts for this token
  const totalBullish = Object.values(analystSummaries).reduce((sum: number, analyst: any) => sum + analyst.bullishCount, 0);
  const totalBearish = Object.values(analystSummaries).reduce((sum: number, analyst: any) => sum + analyst.bearishCount, 0);
  const totalNeutral = Object.values(analystSummaries).reduce((sum: number, analyst: any) => sum + analyst.neutralCount, 0);

  // Determine overall market sentiment based on aggregate signals
  const overallSentiment = totalBullish > totalBearish && totalBullish > totalNeutral ? 'bullish' :
                          totalBearish > totalBullish && totalBearish > totalNeutral ? 'bearish' : 'neutral';

  // UI helper functions for sentiment styling
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-warning';  // Yellow for bullish
      case 'bearish': return 'text-danger';   // Red for bearish
      default: return 'text-secondary';           // Secondary for neutral
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-warning text-dark';  // Yellow badge for bullish
      case 'bearish': return 'bg-danger';             // Red badge for bearish
      default: return 'bg-secondary';                 // Gray badge for neutral
    }
  };

  /**
   * RENDER COMPONENT UI
   */
  return (
    <div className="container mt-4">
      {/* NAVIGATION: Breadcrumb trail for easy navigation */}
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
            Summary
          </li>
        </ol>
      </nav>

      {/* HEADER SECTION: Page title, navigation, and key metrics */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {/* Navigation buttons */}
          <div className="d-flex gap-2 mb-2">
            <Link href={`/analysts/${token}`} className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Analysis
            </Link>
          </div>

          {/* Page title and description */}
          <h1 className="mb-2"><span className="token-name">{tokenUpper}</span> Analyst Summary</h1>
          <p className="text-secondary mb-3">What each analyst has said most about {tokenUpper}</p>

          {/* OVERALL SENTIMENT INDICATOR: Big visual showing market consensus */}
          <div className="d-flex justify-content-center mb-3">
            <div className={`badge fs-6 px-4 py-2 ${
              overallSentiment === 'bullish' ? 'bg-warning text-dark' :
              overallSentiment === 'bearish' ? 'bg-danger' : 'bg-secondary'
            }`}>
              <i className={`bi me-2 ${
                overallSentiment === 'bullish' ? 'bi-arrow-up-circle-fill' :
                overallSentiment === 'bearish' ? 'bi-arrow-down-circle-fill' : 'bi-dash-circle-fill'
              }`}></i>
              Overall Sentiment: {overallSentiment.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Analyst count metric */}
        <div className="text-end">
          <div className="h4 mb-0">{Object.keys(analystSummaries).length}</div>
          <small className="text-secondary">Active Analysts</small>
        </div>
      </div>

      {/* MARKET SENTIMENT OVERVIEW: Visual breakdown of all analyst signals */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card glow-orange">
            <div className="card-body">
               <h5 className="card-title text-center mb-3">
                 <i className="bi bi-graph-up me-2"></i>
                  <span className="token-name">{tokenUpper}</span> <span className="token-name">Market Sentiment Analysis</span>
               </h5>

              {/* Data source info */}
               <div className="text-center mb-3">
                 <small className="text-secondary">
                  Based on {tokenPosts.length} analyst posts from {Object.keys(analystSummaries).length} experts
                </small>
              </div>

              {/* AGGREGATE SENTIMENT STATISTICS: Total bullish/bearish/neutral counts */}
              <div className="row text-center mb-4">
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded">
                    <div className={`h4 mb-1 ${getSentimentColor('bullish')}`}>{totalBullish}</div>
                          <small className="text-secondary">Bullish Signals</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded">
                    <div className={`h4 mb-1 ${getSentimentColor('bearish')}`}>{totalBearish}</div>
                          <small className="text-secondary">Bearish Signals</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded">
                    <div className={`h4 mb-1 ${getSentimentColor('neutral')}`}>{totalNeutral}</div>
                          <small className="text-secondary">Neutral Signals</small>
                  </div>
                </div>
              </div>

              {/* INDIVIDUAL ANALYST SENTIMENT GRID: Quick overview of each analyst's position */}
              <div className="row text-center">
                {Object.entries(analystSummaries).map(([analyst, data]) => {
                  const sentiment = getOverallSentiment(data);
                  return (
                    <div key={analyst} className="col-md-3 mb-3">
                      <div className="p-3 bg-dark rounded">
                        <h6 className="mb-2">
                          <Link href={`/profile/analyst/${analyst}`} className="text-decoration-none text-primary">
                            {analyst}
                          </Link>
                        </h6>
                        <span className={`badge ${getSentimentBadge(sentiment)} mb-2`}>
                          {sentiment.toUpperCase()}
                        </span>
                         <div className="small text-secondary">
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

       {/* DETAILED ANALYST BREAKDOWN: In-depth analysis for each expert */}
       <div className="row">
         {Object.entries(analystSummaries).map(([analyst, data]) => {
           const sentiment = getOverallSentiment(data);
           return (
             <div key={analyst} className="col-12 mb-4">
               <div className="card">
                 {/* Analyst header with name and overall sentiment */}
                 <div className="card-header d-flex justify-content-between align-items-center">
                   <h5 className="mb-0">
                     <i className="bi bi-person-circle me-2"></i>
                     <Link href={`/profile/analyst/${analyst}`} className="text-decoration-none text-primary">
                       {analyst}
                     </Link>
                   </h5>
                   <div className="d-flex align-items-center gap-2">
                     <span className={`badge ${getSentimentBadge(sentiment)}`}>
                       {sentiment.toUpperCase()}
                     </span>
                        <small className="text-secondary">
                       {data.totalPosts} post{data.totalPosts !== 1 ? 's' : ''}
                     </small>
                   </div>
                 </div>
                 <div className="card-body">
                   {/* INDIVIDUAL SENTIMENT BREAKDOWN: Analyst's bullish/bearish/neutral signal counts */}
                   <div className="row mb-3">
                     <div className="col-md-4">
                       <div className="text-center p-3 bg-light rounded">
                         <div className={`h4 mb-1 ${getSentimentColor('bullish')}`}>
                           {data.bullishCount}
                         </div>
                         <small className="text-secondary">Bullish Signals</small>
                       </div>
                     </div>
                     <div className="col-md-4">
                       <div className="text-center p-3 bg-light rounded">
                         <div className={`h4 mb-1 ${getSentimentColor('bearish')}`}>
                           {data.bearishCount}
                         </div>
                         <small className="text-secondary">Bearish Signals</small>
                       </div>
                     </div>
                     <div className="col-md-4">
                       <div className="text-center p-3 bg-light rounded">
                         <div className={`h4 mb-1 ${getSentimentColor('neutral')}`}>
                           {data.neutralCount}
                         </div>
                         <small className="text-secondary">Neutral Signals</small>
                       </div>
                     </div>
                   </div>

                   {/* KEY ANALYSIS POINTS: Most important insights from this analyst */}
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

                   {/* ACTIVITY SUMMARY: Recent posting activity and navigation */}
                   <div className="border-top pt-3">
                     <div className="d-flex justify-content-between align-items-center">
                       <small className="text-secondary">
                         Latest post: {data.latestPost.toLocaleDateString()}
                       </small>
                         <Link
                           href="/comments"
                           className="btn btn-primary btn-sm"
                         >
                           View All Comments
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

      {/* QUICK NAVIGATION: Easy access to related features */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="card-title mb-3">Quick Actions</h6>
               <div className="d-flex justify-content-center gap-3">
                 <Link href="/comments" className="btn btn-primary">
                   <i className="bi bi-chat-quote me-2"></i>
                   View All Comments
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

/**
 * STATIC SITE GENERATION
 * Pre-generate summary pages for all supported tokens at build time
 */
export async function generateStaticParams() {
  const allTokens = await getAllTokens();
  return allTokens.map((token) => ({
    token: token.toLowerCase(), // URL parameters are lowercase
  }));
}
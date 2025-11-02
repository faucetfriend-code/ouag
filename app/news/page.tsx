/**
 * News Feed Page
 *
 * Displays latest cryptocurrency news with category filtering.
 * TODO: Connect to News workflow + Redis database
 */

import Link from 'next/link';
import { getLatestNews, getNewsCategories, NewsCategory } from '@/lib/newsData';

export default async function NewsPage() {
  const news = await getLatestNews(20);
  const categories = await getNewsCategories();

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === 'bullish') return 'text-success';
    if (sentiment === 'bearish') return 'text-danger';
    return 'text-secondary';
  };

  const getSentimentBadge = (sentiment?: string) => {
    if (sentiment === 'bullish') return 'bg-success';
    if (sentiment === 'bearish') return 'bg-danger';
    return 'bg-secondary';
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">News Feed</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-4">
        <h1 className="mb-2">
          <i className="bi bi-newspaper me-2"></i>
          Crypto News Feed
        </h1>
        <p className="text-secondary mb-0">
          Stay updated with the latest cryptocurrency news and market developments
        </p>
        <small className="text-warning d-block mt-2">
          📝 Using mock data - Will connect to news workflow + database
        </small>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-4">
        <div className="d-flex flex-wrap gap-2">
          <span className="badge bg-primary">All News</span>
          {categories.map(category => (
            <span key={category} className="badge bg-secondary" style={{cursor: 'pointer'}}>
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="row g-4">
        {news.map(article => (
          <div key={article.id} className="col-md-6 col-lg-4">
            <div className="card h-100 hover-card">
              <div className="card-body">
                {/* Category & Sentiment Badges */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-info text-dark">{article.category}</span>
                  {article.sentiment && (
                    <span className={`badge ${getSentimentBadge(article.sentiment)}`}>
                      {article.sentiment}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h5 className="card-title mb-2">{article.title}</h5>

                {/* Summary */}
                <p className="card-text text-secondary small mb-3">
                  {article.summary}
                </p>

                {/* Metadata */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    {formatTimeAgo(article.publishedAt)}
                  </small>
                  <small className="text-muted">{article.source}</small>
                </div>

                {/* Tags */}
                <div className="d-flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="badge bg-dark small">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="text-center">
            <small className="text-secondary">
              Looking for analysis? Check out{' '}
              <Link href="/analysts" className="text-primary text-decoration-none">
                analyst insights
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

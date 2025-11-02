'use client';

/**
 * Recent Activity Feed Component
 *
 * Shows recent posts from analysts the user is following
 * Updates dynamically based on user's favorite analysts
 */

import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/lib/user-preferences-context';
import Link from 'next/link';

interface Post {
  id: string;
  user: string;
  token: string;
  content: string;
  timestamp: Date;
  analysis?: string;
}

export default function RecentActivityFeed() {
  const { preferences } = useUserPreferences();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      if (!preferences || preferences.favoriteAnalysts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Call API to fetch posts from followed analysts
        const favoritesParam = preferences.favoriteAnalysts.join(',');
        const response = await fetch(`/api/activity?favorites=${encodeURIComponent(favoritesParam)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch activity');
        }

        const data = await response.json();

        // Convert timestamp strings back to Date objects
        const postsWithDates = data.posts.map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp)
        }));

        setPosts(postsWithDates);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, [preferences]);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return '1 week ago';
    return `${weeks} weeks ago`;
  };

  // Get color based on token (simple hash)
  const getTokenColor = (token: string) => {
    const colors = ['success', 'info', 'warning', 'primary', 'danger'];
    const index = token.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 mb-0 small text-secondary">Loading activity...</p>
      </div>
    );
  }

  if (!preferences || preferences.favoriteAnalysts.length === 0) {
    return (
      <div className="text-center text-secondary py-4">
        <i className="bi bi-inbox display-4 mb-3 d-block"></i>
        <p className="mb-0">Follow analysts to see their recent activity here!</p>
        <small>
          Visit the <Link href="/analysts" className="text-primary">Analysts page</Link> to discover analysts.
        </small>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-secondary py-4">
        <i className="bi bi-clock-history display-4 mb-3 d-block"></i>
        <p className="mb-0">No recent activity from followed analysts.</p>
        <small>Check back later for new posts!</small>
      </div>
    );
  }

  return (
    <div className="timeline">
      {posts.map((post) => (
        <div key={post.id} className="timeline-item mb-3">
          <div className={`timeline-marker bg-${getTokenColor(post.token)}`}></div>
          <div className="timeline-content">
            <small className="text-secondary">{formatTimeAgo(post.timestamp)}</small>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <Link href={`/profile/analyst/${post.user}`} className="text-decoration-none">
                  <strong className="text-primary">@{post.user}</strong>
                </Link>
                {' '}posted about{' '}
                <Link href={`/analysts/${post.token.toLowerCase()}`} className="text-decoration-none">
                  <span className="badge bg-secondary">{post.token}</span>
                </Link>
              </div>
            </div>
            <p className="mb-0 mt-2 small text-secondary">
              {post.content.length > 100
                ? `${post.content.substring(0, 100)}...`
                : post.content}
            </p>
            {post.analysis && (
              <small className="text-muted d-block mt-1">
                <i className="bi bi-lightbulb me-1"></i>
                {post.analysis.length > 80
                  ? `${post.analysis.substring(0, 80)}...`
                  : post.analysis}
              </small>
            )}
            <Link
              href={`/analysts/${post.token.toLowerCase()}`}
              className="btn btn-outline-primary btn-sm mt-2"
            >
              <i className="bi bi-arrow-right me-1"></i>
              View Analysis
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

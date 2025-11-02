/**
 * Activity API Endpoint
 *
 * Fetches recent posts from analysts the user is following
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecentPosts } from '@/lib/analystDataSource';

/**
 * GET /api/activity?favorites=analyst1,analyst2
 * Get recent posts filtered by favorite analysts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const favoritesParam = searchParams.get('favorites');

    if (!favoritesParam) {
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    // Parse favorites from comma-separated string
    const favorites = favoritesParam.split(',').filter(Boolean);

    if (favorites.length === 0) {
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    // Fetch recent posts
    const allPosts = await getRecentPosts(50);

    // Filter to only posts from followed analysts
    const followedPosts = allPosts
      .filter(post => favorites.includes(post.user))
      .slice(0, 10); // Limit to 10 most recent

    return NextResponse.json({ posts: followedPosts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}

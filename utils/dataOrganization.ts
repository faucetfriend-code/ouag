/**
 * Data Organization Utilities
 *
 * Helper functions for organizing and manipulating trading post data.
 */

import { TradingPost } from '../data/mockData';

/**
 * ORGANIZE POSTS BY TOKEN
 * Groups trading posts by their associated cryptocurrency token
 *
 * @param posts - Array of trading posts to organize
 * @returns Object with token symbols as keys and arrays of posts as values
 */
export const organizeDataByToken = (posts: TradingPost[]): Record<string, TradingPost[]> => {
  const organized: Record<string, TradingPost[]> = {};

  posts.forEach(post => {
    // Initialize array for this token if it doesn't exist
    if (!organized[post.token]) {
      organized[post.token] = [];
    }

    // Add post to the appropriate token array
    organized[post.token].push(post);
  });

  return organized;
};


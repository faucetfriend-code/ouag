import { TradingPost } from '../data/mockData';

export const organizeDataByToken = (posts: TradingPost[]): Record<string, TradingPost[]> => {
  const organized: Record<string, TradingPost[]> = {};
  posts.forEach(post => {
    if (!organized[post.token]) {
      organized[post.token] = [];
    }
    organized[post.token].push(post);
  });
  return organized;
};

export const getLatestPosts = (posts: TradingPost[], limit: number = 5): TradingPost[] => {
  return posts
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};
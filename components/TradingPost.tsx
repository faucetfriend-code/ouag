/**
 * Trading Post Component
 *
 * Displays a single trading post with analyst information, content, and analysis.
 * Includes sentiment indicators and timestamp information.
 */

'use client';

import Link from 'next/link';
import { TradingPost as TradingPostType } from '../data/mockData';

interface TradingPostProps {
  post: TradingPostType;
  showChannel?: boolean;
}

/**
 * GENERATE USER COLOR
 * Creates a consistent HSL color for each analyst based on their username
 * Uses a simple hash function to ensure the same user always gets the same color
 */
const getUserColor = (userName: string): string => {
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360; // Convert hash to hue (0-360)
  return `hsl(${hue}, 70%, 50%)`;   // High saturation, medium lightness
};

export default function TradingPost({ post, showChannel = true }: TradingPostProps) {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-2"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: getUserColor(post.user),
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            {post.user.charAt(0).toUpperCase()}
          </div>
           <div>
             <Link href={`/profile/analyst/${post.user}`} className="text-decoration-none">
               <h6 className="mb-0" style={{ color: getUserColor(post.user) }}>
                 {post.user}
               </h6>
             </Link>
             {showChannel && (
               <small className="text-secondary">#{post.channel}</small>
             )}
           </div>
        </div>
        <small className="text-secondary">
          {post.timestamp.toLocaleDateString()} {post.timestamp.toLocaleTimeString()}
        </small>
      </div>
      <div className="card-body">
        <p className="card-text mb-2">{post.content}</p>
        {post.analysis && (
          <div className="alert alert-info py-2 px-3 mb-0">
            <small>
              <strong>Analysis:</strong> {post.analysis}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
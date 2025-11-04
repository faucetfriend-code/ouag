/**
 * Token Card Component
 *
 * Interactive card displaying analysis summary and chart for a specific cryptocurrency.
 * Allows users to toggle visibility of individual analysts in the chart.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TradingPost } from '../data/mockData';
import TokenChart from './TokenChart';
import { summarizeTokenData } from '../utils/summarization';

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

interface TokenCardProps {
  token: string;        // Token symbol (e.g., "BTC")
  posts: TradingPost[]; // All trading posts for this token
}

export default function TokenCard({ token, posts }: TokenCardProps) {
  // State: Which analysts should be visible in the chart
  const [visibleAnalysts, setVisibleAnalysts] = useState<string[]>(
    posts.map(p => p.user) // Start with all analysts visible
  );

  // Toggle analyst visibility in chart
  const toggleAnalyst = (analyst: string) => {
    setVisibleAnalysts(prev =>
      prev.includes(analyst)
        ? prev.filter(a => a !== analyst)  // Remove analyst
        : [...prev, analyst]               // Add analyst
    );
  };

  // Generate summary text for this token
  const summary = summarizeTokenData(posts);

  return (
    <div className="card mb-4">
      {/* CARD HEADER: Token symbol */}
      <div className="card-header">
        <h5 className="card-title token-name">{token}</h5>
      </div>

       <div className="card-body">
         {/* SUMMARY TEXT: Auto-generated sentiment overview */}
         <p className="card-text" style={{ color: '#87CEEB' }}>{summary}</p>

         {/* ANALYST TOGGLE CONTROLS: Checkboxes to show/hide analysts in chart */}
         <div className="mb-3">
           <h6 style={{ color: '#8B0000' }}>Analysts:</h6>
           {Array.from(new Set(posts.map(p => p.user))).map(analyst => (
             <div key={analyst} className="form-check form-check-inline">
               <input
                 className="form-check-input"
                 type="checkbox"
                 checked={visibleAnalysts.includes(analyst)}
                 onChange={() => toggleAnalyst(analyst)}
                 id={`${token}-${analyst}`}
               />
                <Link href={`/profile/analyst/${analyst}`} className="text-decoration-none">
                  <label className="form-check-label" htmlFor={`${token}-${analyst}`} style={{ color: getUserColor(analyst), cursor: 'pointer' }}>
                    {analyst}
                  </label>
                </Link>
             </div>
           ))}
         </div>

        {/* INTERACTIVE CHART: Visual representation of analyst data */}
        <TokenChart posts={posts} visibleAnalysts={visibleAnalysts} />
      </div>
    </div>
  );
}
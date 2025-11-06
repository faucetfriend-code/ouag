/**
 * Token Card Component
 *
 * Interactive card displaying analysis summary and chart for a specific cryptocurrency.
 * Allows users to toggle visibility of individual analysts in the chart.
 * Enhanced with swipe gestures for quick actions (favorite, hide, share).
 */

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useGesture } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import { TradingPost } from '../data/mockData';
import TokenChart from './TokenChart';
import { summarizeTokenData } from '../utils/summarization';
import { mediumImpact, successNotification } from '../lib/haptics';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

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

  // Swipe gesture handling
  const bind = useGesture({
    onDrag: ({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      const trigger = Math.abs(mx) > 50 && Math.abs(vx) > 0.5;

      setIsSwiping(active);
      setSwipeOffset(mx);

      if (trigger) {
        setSwipeDirection(xDir > 0 ? 'right' : 'left');
      } else if (!active) {
        setSwipeDirection(null);
        setSwipeOffset(0);
      }
    },
    onDragEnd: ({ movement: [mx], velocity: [vx] }) => {
      const trigger = Math.abs(mx) > 50 && Math.abs(vx) > 0.5;

      if (trigger) {
        // Execute swipe action
        if (swipeDirection === 'left') {
          // Hide card action
          console.log(`Hiding ${token} card`);
          mediumImpact(); // Haptic feedback for hide action
        } else if (swipeDirection === 'right') {
          // Favorite action
          console.log(`Favoriting ${token}`);
          successNotification(); // Haptic feedback for favorite action
        }
      }

      // Reset swipe state
      setIsSwiping(false);
      setSwipeDirection(null);
      setSwipeOffset(0);
    },
  }, {
    drag: {
      axis: 'x',
      bounds: { left: -100, right: 100 },
      rubberband: true,
    },
  });

  // Generate summary text for this token
  const summary = summarizeTokenData(posts);

  return (
    <div className="card-container mb-4">
      {/* SWIPE ACTION BUTTONS */}
      <AnimatePresence>
        {swipeDirection === 'left' && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="swipe-action left-action"
          >
            <i className="bi bi-eye-slash"></i>
            <span>Hide</span>
          </motion.div>
        )}
        {swipeDirection === 'right' && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="swipe-action right-action"
          >
            <i className="bi bi-heart"></i>
            <span>Favorite</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SWIPEABLE CARD */}
      <motion.div
        className={`card ${isSwiping ? 'swiping' : ''}`}
        style={{
          x: swipeOffset,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        animate={{ x: swipeOffset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div {...bind()} style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}>
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
      </motion.div>
    </div>
  );
}
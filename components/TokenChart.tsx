/**
 * Token Chart Component
 *
 * Interactive line chart displaying price data from different analysts.
 * Each analyst gets a unique color and can be toggled on/off.
 * Enhanced with touch gestures for mobile: pinch-to-zoom, pan, swipe navigation.
 */

'use client';

import { useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useGesture } from '@use-gesture/react';
import { TradingPost } from '../data/mockData';

// Register Chart.js components globally
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TokenChartProps {
  posts: TradingPost[];     // All trading posts for this token
  visibleAnalysts: string[]; // Which analysts to show in the chart
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

export default function TokenChart({ posts, visibleAnalysts }: TokenChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Create chart datasets - one line per visible analyst
  const datasets = posts
    .filter(post => visibleAnalysts.includes(post.user)) // Only show selected analysts
    .map(post => ({
      label: post.user,                           // Analyst name for legend
      data: post.chartData || [],                 // Price data points
      borderColor: getUserColor(post.user),       // Unique color per analyst
      backgroundColor: 'rgba(0,0,0,0)',           // Transparent background
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4, // Smooth curves
    }));

  // Chart data structure
  const data = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'], // X-axis labels
    datasets,
  };

  // Enhanced chart configuration with touch support
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Token Price Chart',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price ($)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  };

  // Touch gesture handling
  const bind = useGesture({
    onPinch: ({ offset: [scale] }) => {
      setZoomLevel(Math.max(0.5, Math.min(3, scale)));
    },
    onDrag: ({ offset: [x, y] }) => {
      setPanOffset({ x, y });
    },
    onPinchEnd: () => {
      // Reset zoom after pinch ends for better UX
      setTimeout(() => setZoomLevel(1), 1000);
    },
  });

  return (
    <div
      {...bind()}
      className="chart-container"
      style={{
        touchAction: 'none',
        transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        transformOrigin: 'center',
        transition: zoomLevel === 1 ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
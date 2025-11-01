/**
 * Token Chart Component
 *
 * Interactive line chart displaying price data from different analysts.
 * Each analyst gets a unique color and can be toggled on/off.
 */

'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
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
  // Create chart datasets - one line per visible analyst
  const datasets = posts
    .filter(post => visibleAnalysts.includes(post.user)) // Only show selected analysts
    .map(post => ({
      label: post.user,                           // Analyst name for legend
      data: post.chartData || [],                 // Price data points
      borderColor: getUserColor(post.user),       // Unique color per analyst
      backgroundColor: 'rgba(0,0,0,0)',           // Transparent background
    }));

  // Chart data structure
  const data = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'], // X-axis labels
    datasets,
  };

  // Chart configuration options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,  // Legend at top of chart
      },
      title: {
        display: true,
        text: 'Token Price Chart', // Chart title
      },
    },
  };

  return <Line data={data} options={options} />;
}
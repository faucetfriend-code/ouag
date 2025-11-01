'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { TradingPost } from '../data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TokenChartProps {
  posts: TradingPost[];
  visibleAnalysts: string[];
}

const getUserColor = (userName: string): string => {
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

export default function TokenChart({ posts, visibleAnalysts }: TokenChartProps) {
  const datasets = posts
    .filter(post => visibleAnalysts.includes(post.user))
    .map(post => ({
      label: post.user,
      data: post.chartData || [],
      borderColor: getUserColor(post.user),
      backgroundColor: 'rgba(0,0,0,0)',
    }));

  const data = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Token Price Chart',
      },
    },
  };

  return <Line data={data} options={options} />;
}
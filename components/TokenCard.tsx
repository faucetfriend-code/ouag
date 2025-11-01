'use client';

import { useState } from 'react';
import { TradingPost } from '../data/mockData';
import TokenChart from './TokenChart';
import { summarizeTokenData } from '../utils/summarization';

interface TokenCardProps {
  token: string;
  posts: TradingPost[];
}

export default function TokenCard({ token, posts }: TokenCardProps) {
  const [visibleAnalysts, setVisibleAnalysts] = useState<string[]>(posts.map(p => p.user));

  const toggleAnalyst = (analyst: string) => {
    setVisibleAnalysts(prev =>
      prev.includes(analyst)
        ? prev.filter(a => a !== analyst)
        : [...prev, analyst]
    );
  };

  const summary = summarizeTokenData(posts);

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title">{token}</h5>
      </div>
      <div className="card-body">
        <p className="card-text">{summary}</p>
        <div className="mb-3">
          <h6>Analysts:</h6>
          {Array.from(new Set(posts.map(p => p.user))).map(analyst => (
            <div key={analyst} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                checked={visibleAnalysts.includes(analyst)}
                onChange={() => toggleAnalyst(analyst)}
                id={`${token}-${analyst}`}
              />
              <label className="form-check-label" htmlFor={`${token}-${analyst}`}>
                {analyst}
              </label>
            </div>
          ))}
        </div>
        <TokenChart posts={posts} visibleAnalysts={visibleAnalysts} />
      </div>
    </div>
  );
}
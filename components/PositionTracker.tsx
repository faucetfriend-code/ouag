'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useUserPreferences } from '@/lib/user-preferences-context';
import MonthlyPnL from './MonthlyPnL';

interface OpenPosition {
  id: string;
  tradeId: string;
  token: string;
  side: 'long' | 'short';
  amount: number;
  entryPrice: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  unrealizedPnL: number;
  currentPrice: number;
  status: string;
  exchange?: string;
  createdAt: string;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

const currencies: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
];

export default function PositionTracker() {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'positions' | 'monthly'>('positions');

  // Mock data for demonstration - replace with real API calls
  const mockPositions: OpenPosition[] = [
    {
      id: 'pos_1',
      tradeId: 'trade_1',
      token: 'BTC',
      side: 'long',
      amount: 0.5,
      entryPrice: 45000,
      leverage: 5,
      margin: 4500,
      liquidationPrice: 40500,
      unrealizedPnL: 1250,
      currentPrice: 47000,
      status: 'open',
      exchange: 'Binance',
      createdAt: '2024-11-01T10:00:00Z',
    },
    {
      id: 'pos_2',
      tradeId: 'trade_2',
      token: 'ETH',
      side: 'short',
      amount: 10,
      entryPrice: 2800,
      leverage: 3,
      margin: 9333.33,
      liquidationPrice: 3086.67,
      unrealizedPnL: -833.33,
      currentPrice: 2720,
      status: 'open',
      exchange: 'Bybit',
      createdAt: '2024-11-02T14:30:00Z',
    },
  ];

  useEffect(() => {
    loadPositions();
  }, [user]);

  const loadPositions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/positions');
      // const data = await response.json();

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPositions(mockPositions);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load positions');
      console.error('Error loading positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (!preferences?.currencyPreferences) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }

    const { primaryCurrency, displayFormat } = preferences.currencyPreferences;
    const currency = currencies.find(c => c.code === primaryCurrency) || currencies[0];

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: primaryCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: primaryCurrency === 'BTC' || primaryCurrency === 'ETH' ? 8 : 2,
    }).format(amount);

    if (displayFormat === 'symbol') {
      return formatted;
    } else {
      return formatted.replace(currency.symbol, `${currency.code} `);
    }
  };

  const getPnLClass = (pnl: number): string => {
    if (pnl > 0) return 'text-success fw-bold';
    if (pnl < 0) return 'text-danger fw-bold';
    return 'text-secondary';
  };

  const getLiquidationRisk = (currentPrice: number, liquidationPrice: number, side: string): 'high' | 'medium' | 'low' => {
    const distance = Math.abs(currentPrice - liquidationPrice) / currentPrice;

    if (side === 'long') {
      return currentPrice <= liquidationPrice ? 'high' :
             distance < 0.02 ? 'medium' : 'low';
    } else {
      return currentPrice >= liquidationPrice ? 'high' :
             distance < 0.02 ? 'medium' : 'low';
    }
  };

  const getRiskBadgeClass = (risk: 'high' | 'medium' | 'low'): string => {
    switch (risk) {
      case 'high': return 'badge bg-danger';
      case 'medium': return 'badge bg-warning';
      case 'low': return 'badge bg-success';
    }
  };

  const calculateTotalPnL = (): number => {
    return positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  };

  const calculateTotalMargin = (): number => {
    return positions.reduce((sum, pos) => sum + pos.margin, 0);
  };

  const closePosition = async (positionId: string) => {
    if (!confirm('Are you sure you want to close this position?')) return;

    try {
      // TODO: Implement position closure API
      console.log('Closing position:', positionId);
      alert('Position closure functionality will be implemented with real API integration.');
    } catch (error) {
      console.error('Error closing position:', error);
      alert('Failed to close position');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-secondary">Please log in to view your positions.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading positions...</span>
        </div>
        <p className="mt-2 text-secondary">Loading positions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
        <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadPositions}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="position-tracker">
      {/* Tab Navigation */}
      <div className="mb-4">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'positions' ? 'active' : ''}`}
              onClick={() => setActiveTab('positions')}
              type="button"
              role="tab"
            >
              <i className="bi bi-lightning-charge me-2"></i>
              Open Positions
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => setActiveTab('monthly')}
              type="button"
              role="tab"
            >
              <i className="bi bi-calendar me-2"></i>
              Monthly P&L
            </button>
          </li>
        </ul>
      </div>

       {/* Tab Content */}
       {activeTab === 'positions' ? (
         <>
           {/* Summary Cards */}
           <div className="row mb-4">
         <div className="col-md-3">
           <div className="card text-center">
             <div className="card-body">
               <div className={`h4 ${getPnLClass(calculateTotalPnL())}`}>
                 {formatCurrency(calculateTotalPnL())}
               </div>
               <small className="text-secondary">Total Unrealized P&L</small>
             </div>
           </div>
         </div>
         <div className="col-md-3">
           <div className="card text-center">
             <div className="card-body">
               <div className="h4">{formatCurrency(calculateTotalMargin())}</div>
               <small className="text-secondary">Total Margin Used</small>
             </div>
           </div>
         </div>
         <div className="col-md-3">
           <div className="card text-center">
             <div className="card-body">
               <div className="h4">{positions.length}</div>
               <small className="text-secondary">Open Positions</small>
             </div>
           </div>
         </div>
         <div className="col-md-3">
           <div className="card text-center">
             <div className="card-body">
               <div className="h6 text-secondary">
                 {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'Not updated'}
               </div>
               <button className="btn btn-sm btn-outline-primary mt-1" onClick={loadPositions}>
                 <i className="bi bi-arrow-clockwise me-1"></i>
                 Refresh
               </button>
             </div>
           </div>
         </div>
       </div>

       {/* Positions Table */}
       {positions.length === 0 ? (
         <div className="text-center py-5">
           <i className="bi bi-graph-up display-4 text-secondary mb-3"></i>
           <h5 className="text-secondary">No Open Positions</h5>
           <p className="text-secondary">Your leveraged positions will appear here.</p>
         </div>
       ) : (
         <div className="table-responsive">
           <table className="table table-hover">
             <thead>
               <tr>
                 <th>Token</th>
                 <th>Side</th>
                 <th>Leverage</th>
                 <th>Size</th>
                 <th>Entry Price</th>
                 <th>Current Price</th>
                 <th>Liquidation</th>
                 <th>Risk</th>
                 <th>Unrealized P&L</th>
                 <th>Actions</th>
               </tr>
             </thead>
             <tbody>
               {positions.map((position) => {
                 const riskLevel = getLiquidationRisk(
                   position.currentPrice,
                   position.liquidationPrice,
                   position.side
                 );

                 return (
                   <tr key={position.id}>
                     <td>
                       <div className="d-flex align-items-center">
                         <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                              style={{ width: '32px', height: '32px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                           {position.token.slice(0, 2)}
                         </div>
                         <div>
                           <div className="fw-bold">{position.token}</div>
                           <small className="text-secondary">{position.exchange}</small>
                         </div>
                       </div>
                     </td>
                     <td>
                       <span className={`badge ${position.side === 'long' ? 'bg-success' : 'bg-danger'}`}>
                         {position.side.toUpperCase()}
                       </span>
                     </td>
                     <td>
                       <span className="badge bg-primary">{position.leverage}x</span>
                     </td>
                     <td>
                       <div>
                         <div>{position.amount} {position.token}</div>
                         <small className="text-secondary">
                           Margin: {formatCurrency(position.margin)}
                         </small>
                       </div>
                     </td>
                     <td className="text-end">
                       {formatCurrency(position.entryPrice)}
                     </td>
                     <td className="text-end fw-bold">
                       {formatCurrency(position.currentPrice)}
                     </td>
                     <td className="text-end">
                       <div className={position.currentPrice <= position.liquidationPrice && position.side === 'long' ||
                                     position.currentPrice >= position.liquidationPrice && position.side === 'short'
                                     ? 'text-danger fw-bold' : ''}>
                         {formatCurrency(position.liquidationPrice)}
                       </div>
                     </td>
                     <td>
                       <span className={getRiskBadgeClass(riskLevel)}>
                         {riskLevel.toUpperCase()}
                       </span>
                     </td>
                     <td className={`text-end ${getPnLClass(position.unrealizedPnL)}`}>
                       <div>{formatCurrency(position.unrealizedPnL)}</div>
                       <small>
                         ({((position.unrealizedPnL / position.margin) * 100).toFixed(2)}%)
                       </small>
                     </td>
                     <td>
                       <div className="btn-group" role="group">
                         <button
                           className="btn btn-sm btn-outline-primary"
                           title="Edit Position"
                         >
                           <i className="bi bi-pencil"></i>
                         </button>
                         <button
                           className="btn btn-sm btn-outline-success"
                           onClick={() => closePosition(position.id)}
                           title="Close Position"
                         >
                           <i className="bi bi-x-circle"></i>
                         </button>
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         </div>
       )}

       {/* Risk Warnings */}
       {positions.some(pos => {
         const risk = getLiquidationRisk(pos.currentPrice, pos.liquidationPrice, pos.side);
         return risk === 'high';
       }) && (
         <div className="alert alert-danger mt-3">
           <i className="bi bi-exclamation-triangle-fill me-2"></i>
           <strong>Liquidation Risk:</strong> One or more positions are at high risk of liquidation.
           Consider reducing position sizes or adding more margin.
         </div>
       )}

       {/* Footer */}
       <div className="mt-3 text-center">
         <small className="text-secondary">
           Positions are updated in real-time. P&L calculations are estimates and may vary by exchange.
         </small>
       </div>
         </>
       ) : (
         <MonthlyPnL />
       )}
     </div>
   );
 }
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useUserPreferences } from '@/lib/user-preferences-context';

interface MonthlyPnLData {
  id: string;
  monthYear: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  totalVolume: number;
  totalFees: number;
  winRate: number;
  avgWin?: number;
  avgLoss?: number;
  largestWin: number;
  largestLoss: number;
  sharpeRatio?: number;
  maxDrawdown: number;
  status: string;
  finalizedAt?: string;
}

export default function MonthlyPnL() {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [monthlyData, setMonthlyData] = useState<MonthlyPnLData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    loadMonthlyPnL();
  }, [user]);

  const loadMonthlyPnL = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/monthly-pnl');
      // const data = await response.json();

      // Mock data for demonstration
      const mockData: MonthlyPnLData[] = [
        {
          id: 'mpl_1',
          monthYear: '2024-11',
          totalTrades: 24,
          winningTrades: 16,
          losingTrades: 8,
          totalPnL: 2450.75,
          totalVolume: 125000,
          totalFees: 125.50,
          winRate: 66.67,
          avgWin: 184.42,
          avgLoss: -67.81,
          largestWin: 450.25,
          largestLoss: -125.30,
          sharpeRatio: 1.85,
          maxDrawdown: 320.50,
          status: 'active',
        },
        {
          id: 'mpl_2',
          monthYear: '2024-10',
          totalTrades: 31,
          winningTrades: 19,
          losingTrades: 12,
          totalPnL: 1820.30,
          totalVolume: 98000,
          totalFees: 98.00,
          winRate: 61.29,
          avgWin: 132.45,
          avgLoss: -89.25,
          largestWin: 380.75,
          largestLoss: -145.60,
          sharpeRatio: 1.42,
          maxDrawdown: 280.25,
          status: 'finalized',
          finalizedAt: '2024-10-31T23:59:59Z',
        },
        {
          id: 'mpl_3',
          monthYear: '2024-09',
          totalTrades: 28,
          winningTrades: 15,
          losingTrades: 13,
          totalPnL: -320.45,
          totalVolume: 87500,
          totalFees: 87.50,
          winRate: 53.57,
          avgWin: 156.78,
          avgLoss: -98.34,
          largestWin: 420.90,
          largestLoss: -180.25,
          sharpeRatio: -0.23,
          maxDrawdown: 450.75,
          status: 'finalized',
          finalizedAt: '2024-09-30T23:59:59Z',
        },
      ];

      setMonthlyData(mockData);

      // Set current month as default if available
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const currentMonthData = mockData.find(m => m.monthYear === currentMonth);
      if (currentMonthData) {
        setSelectedMonth(currentMonth);
      } else {
        setSelectedMonth(mockData[0]?.monthYear || '');
      }

      setError(null);
    } catch (err) {
      setError('Failed to load monthly P&L data');
      console.error('Error loading monthly P&L:', err);
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
    const currency = [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
      { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
    ].find(c => c.code === primaryCurrency) || { code: 'USD', symbol: '$' };

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

  const formatMonthYear = (monthYear: string): string => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getPnLClass = (pnl: number): string => {
    if (pnl > 0) return 'text-success fw-bold';
    if (pnl < 0) return 'text-danger fw-bold';
    return 'text-secondary';
  };

  const getWinRateClass = (winRate: number): string => {
    if (winRate >= 60) return 'text-success fw-bold';
    if (winRate >= 50) return 'text-warning fw-bold';
    return 'text-danger fw-bold';
  };

  const selectedData = monthlyData.find(m => m.monthYear === selectedMonth);

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-secondary">Please log in to view monthly P&L statements.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading monthly P&L...</span>
        </div>
        <p className="mt-2 text-secondary">Loading monthly performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
        <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadMonthlyPnL}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="monthly-pnl">
      {/* Month Selector */}
      <div className="mb-4">
        <label className="form-label fw-bold">Select Month</label>
        <select
          className="form-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {monthlyData.map((month) => (
            <option key={month.monthYear} value={month.monthYear}>
              {formatMonthYear(month.monthYear)}
              {month.status === 'active' && ' (Current)'}
              {month.status === 'finalized' && ' (Finalized)'}
            </option>
          ))}
        </select>
      </div>

      {selectedData ? (
        <>
          {/* Month Header */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-calendar me-2"></i>
                {formatMonthYear(selectedData.monthYear)} Performance
                {selectedData.status === 'active' && (
                  <span className="badge bg-primary ms-2">Active</span>
                )}
                {selectedData.status === 'finalized' && (
                  <span className="badge bg-success ms-2">Finalized</span>
                )}
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className={`h3 ${getPnLClass(selectedData.totalPnL)}`}>
                    {formatCurrency(selectedData.totalPnL)}
                  </div>
                  <small className="text-secondary">Total P&L</small>
                </div>
                <div className="col-md-3">
                  <div className={`h3 ${getWinRateClass(selectedData.winRate)}`}>
                    {selectedData.winRate.toFixed(1)}%
                  </div>
                  <small className="text-secondary">Win Rate</small>
                </div>
                <div className="col-md-3">
                  <div className="h3">{selectedData.totalTrades}</div>
                  <small className="text-secondary">Total Trades</small>
                </div>
                <div className="col-md-3">
                  <div className="h3">{formatCurrency(selectedData.totalVolume)}</div>
                  <small className="text-secondary">Total Volume</small>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="row mb-4">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Trade Performance</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6">
                      <div className="text-center mb-3">
                        <div className="h5 text-success">{selectedData.winningTrades}</div>
                        <small className="text-secondary">Winning Trades</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center mb-3">
                        <div className="h5 text-danger">{selectedData.losingTrades}</div>
                        <small className="text-secondary">Losing Trades</small>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-6">
                      <div className="text-center mb-3">
                        <div className="h6 text-success">
                          {selectedData.avgWin ? formatCurrency(selectedData.avgWin) : 'N/A'}
                        </div>
                        <small className="text-secondary">Avg Win</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center mb-3">
                        <div className="h6 text-danger">
                          {selectedData.avgLoss ? formatCurrency(Math.abs(selectedData.avgLoss)) : 'N/A'}
                        </div>
                        <small className="text-secondary">Avg Loss</small>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-6">
                      <div className="text-center">
                        <div className="h6 text-success">{formatCurrency(selectedData.largestWin)}</div>
                        <small className="text-secondary">Largest Win</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <div className="h6 text-danger">{formatCurrency(Math.abs(selectedData.largestLoss))}</div>
                        <small className="text-secondary">Largest Loss</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Risk Metrics</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Sharpe Ratio</span>
                      <span className={`fw-bold ${selectedData.sharpeRatio && selectedData.sharpeRatio > 0 ? 'text-success' : 'text-danger'}`}>
                        {selectedData.sharpeRatio ? selectedData.sharpeRatio.toFixed(2) : 'N/A'}
                      </span>
                    </div>
                    <div className="progress mt-2" style={{ height: '6px' }}>
                      <div
                        className={`progress-bar ${selectedData.sharpeRatio && selectedData.sharpeRatio > 0 ? 'bg-success' : 'bg-danger'}`}
                        style={{
                          width: selectedData.sharpeRatio ?
                            Math.min(Math.max((selectedData.sharpeRatio + 1) * 50, 0), 100) + '%' : '0%'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Max Drawdown</span>
                      <span className="fw-bold text-danger">
                        {formatCurrency(selectedData.maxDrawdown)}
                      </span>
                    </div>
                    <div className="progress mt-2" style={{ height: '6px' }}>
                      <div
                        className="progress-bar bg-danger"
                        style={{
                          width: selectedData.totalPnL !== 0 ?
                            Math.min((selectedData.maxDrawdown / Math.abs(selectedData.totalPnL)) * 100, 100) + '%' : '0%'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Total Fees</span>
                      <span className="fw-bold text-warning">
                        {formatCurrency(selectedData.totalFees)}
                      </span>
                    </div>
                    <small className="text-secondary">
                      {selectedData.totalVolume > 0 ?
                        ((selectedData.totalFees / selectedData.totalVolume) * 100).toFixed(3) + '% of volume' :
                        '0% of volume'
                      }
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Monthly Performance Chart</h6>
            </div>
            <div className="card-body text-center py-5">
              <i className="bi bi-bar-chart-line display-4 text-secondary mb-3"></i>
              <h6 className="text-secondary">Performance Chart</h6>
              <p className="text-secondary mb-0">
                Interactive charts showing daily P&L, drawdown, and trade performance will be available here.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-calendar-x display-4 text-secondary mb-3"></i>
          <h5 className="text-secondary">No Data Available</h5>
          <p className="text-secondary">No trading data found for the selected month.</p>
        </div>
      )}
    </div>
  );
}
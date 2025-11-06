'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

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
  { code: 'BNB', name: 'Binance Coin', symbol: 'BNB' },
  { code: 'ADA', name: 'Cardano', symbol: 'ADA' },
  { code: 'SOL', name: 'Solana', symbol: 'SOL' },
];

export default function CurrencySettingsPage() {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [displayFormat, setDisplayFormat] = useState<'symbol' | 'code'>('symbol');
  const [thousandsSeparator, setThousandsSeparator] = useState(true);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h1 className="mb-3">Currency Settings</h1>
          <p className="text-secondary mb-4">Please log in to access your currency settings.</p>
          <Link href="/login" className="btn btn-primary">
            <i className="bi bi-discord me-2"></i>
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  // Load saved preferences when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/user/currency');
        if (response.ok) {
          const data = await response.json();
          const settings = data.settings;
          setSelectedCurrency(settings.selectedCurrency || 'USD');
          setDisplayFormat(settings.displayFormat || 'symbol');
          setThousandsSeparator(settings.thousandsSeparator !== false);
          setDecimalPlaces(settings.decimalPlaces || 2);
        } else {
          // Fallback to localStorage if API fails
          const savedCurrency = localStorage.getItem('preferred_currency') || 'USD';
          const savedFormat = localStorage.getItem('currency_display_format') || 'symbol';
          const savedThousands = localStorage.getItem('currency_thousands_separator') !== 'false';
          const savedDecimals = parseInt(localStorage.getItem('currency_decimal_places') || '2');

          setSelectedCurrency(savedCurrency);
          setDisplayFormat(savedFormat as 'symbol' | 'code');
          setThousandsSeparator(savedThousands);
          setDecimalPlaces(savedDecimals);
        }
      } catch (error) {
        console.error('Error loading currency settings:', error);
        // Fallback to defaults
        setSelectedCurrency('USD');
        setDisplayFormat('symbol');
        setThousandsSeparator(true);
        setDecimalPlaces(2);
      }
    };

    loadSettings();
  }, []);

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
  };

  const handleFormatChange = (format: 'symbol' | 'code') => {
    setDisplayFormat(format);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to API
      const response = await fetch('/api/user/currency', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedCurrency,
          displayFormat,
          thousandsSeparator,
          decimalPlaces,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save currency settings');
      }

      const data = await response.json();

      // Also save to localStorage as backup
      localStorage.setItem('preferred_currency', selectedCurrency);
      localStorage.setItem('currency_display_format', displayFormat);
      localStorage.setItem('currency_thousands_separator', thousandsSeparator.toString());
      localStorage.setItem('currency_decimal_places', decimalPlaces.toString());

      alert('Currency preferences saved successfully!');
    } catch (error) {
      console.error('Error saving currency settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrencyPreview = (amount: number) => {
    const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);
    if (!selectedCurrencyData) return `${amount}`;

    let formattedAmount = amount.toFixed(decimalPlaces);

    if (thousandsSeparator) {
      formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      });
    }

    if (displayFormat === 'symbol') {
      return `${selectedCurrencyData.symbol}${formattedAmount}`;
    } else {
      return `${selectedCurrencyData.code} ${formattedAmount}`;
    }
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/settings" className="text-decoration-none">Settings</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Currency
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Currency & Display Preferences</h1>
        <p className="text-secondary mb-0">Choose your preferred currency and customize how prices and values are displayed</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Primary Currency Selection */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-currency-exchange me-2"></i>
                Primary Currency
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Select your primary currency for displaying prices and portfolio values.
              </p>
              <div className="row g-3">
                {currencies.map((currency) => (
                  <div key={currency.code} className="col-6 col-md-4">
                    <div
                      className={`card h-100 cursor-pointer border-2 ${
                        selectedCurrency === currency.code
                          ? 'border-primary bg-light'
                          : 'border-secondary'
                      }`}
                      onClick={() => handleCurrencyChange(currency.code)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center p-3">
                        <div className="fs-3 mb-2">{currency.symbol}</div>
                        <div className="fw-bold small mb-1">{currency.code}</div>
                        <div className="text-secondary small">{currency.name}</div>
                        {selectedCurrency === currency.code && (
                          <div className="mt-2">
                            <i className="bi bi-check-circle-fill text-primary"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Display Format Options */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-display me-2"></i>
                Display Format
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                Customize how currency values are formatted and displayed.
              </p>

              <div className="row">
                <div className="col-md-6">
                  <h6 className="mb-3">Currency Display</h6>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="displayFormat"
                        id="formatSymbol"
                        checked={displayFormat === 'symbol'}
                        onChange={() => handleFormatChange('symbol')}
                      />
                      <label className="form-check-label" htmlFor="formatSymbol">
                        <strong>Use Symbols</strong>
                        <br />
                        <small className="text-secondary">e.g., $1,000 or ₿0.05</small>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="displayFormat"
                        id="formatCode"
                        checked={displayFormat === 'code'}
                        onChange={() => handleFormatChange('code')}
                      />
                      <label className="form-check-label" htmlFor="formatCode">
                        <strong>Use Codes</strong>
                        <br />
                        <small className="text-secondary">e.g., USD 1,000 or BTC 0.05</small>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <h6 className="mb-3">Number Formatting</h6>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="thousandsSeparator"
                        checked={thousandsSeparator}
                        onChange={(e) => setThousandsSeparator(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="thousandsSeparator">
                        <strong>Thousands Separator</strong>
                        <br />
                        <small className="text-secondary">Show commas in large numbers</small>
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="decimalPlaces" className="form-label">
                      <strong>Decimal Places</strong>
                    </label>
                    <select
                      className="form-select"
                      id="decimalPlaces"
                      value={decimalPlaces}
                      onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                    >
                      <option value={0}>0 (e.g., $1,250)</option>
                      <option value={1}>1 (e.g., $1,250.0)</option>
                      <option value={2}>2 (e.g., $1,250.00)</option>
                      <option value={3}>3 (e.g., $1,250.000)</option>
                      <option value={4}>4 (e.g., $1,250.0000)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-eye me-2"></i>
                Preview
              </h5>
            </div>
            <div className="card-body">
              <p className="text-secondary mb-4">
                See how your currency settings will look in the application.
              </p>
              <div className="row">
                <div className="col-md-6">
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-2">Portfolio Value</h6>
                    <div className="fs-4 fw-bold text-primary">
                      {formatCurrencyPreview(12345.67)}
                    </div>
                    <small className="text-secondary">Total portfolio value</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-2">Bitcoin Price</h6>
                    <div className="fs-4 fw-bold text-success">
                      {formatCurrencyPreview(58750.25)}
                    </div>
                    <small className="text-secondary">Current BTC price</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-2">Small Amount</h6>
                    <div className="fs-4 fw-bold text-info">
                      {formatCurrencyPreview(0.05)}
                    </div>
                    <small className="text-secondary">Crypto amount</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-2">Large Number</h6>
                    <div className="fs-4 fw-bold text-warning">
                      {formatCurrencyPreview(1000000)}
                    </div>
                    <small className="text-secondary">Million dollar value</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Currency Tips</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6><i className="bi bi-star text-warning me-2"></i>Choose Familiar</h6>
                <p className="small text-secondary mb-3">
                  Select a currency you're familiar with for easier mental calculations.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-eye text-info me-2"></i>Display Consistency</h6>
                <p className="small text-secondary mb-3">
                  Your currency preferences will be applied consistently across the app.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-graph-up text-success me-2"></i>Crypto Symbols</h6>
                <p className="small text-secondary mb-0">
                  Use crypto symbols (₿, Ξ) for a more native cryptocurrency experience.
                </p>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h6 className="mb-3">Quick Actions</h6>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Preferences
                    </>
                  )}
                </button>
                <Link href="/settings" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
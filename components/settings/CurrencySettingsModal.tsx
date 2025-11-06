'use client';

import { useState, useEffect } from 'react';
import { useUserPreferences } from '@/lib/user-preferences-context';

interface CurrencySettingsModalProps {
  show: boolean;
  onHide: () => void;
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
  { code: 'BNB', name: 'Binance Coin', symbol: 'BNB' },
  { code: 'ADA', name: 'Cardano', symbol: 'ADA' },
  { code: 'SOL', name: 'Solana', symbol: 'SOL' },
];

export default function CurrencySettingsModal({ show, onHide }: CurrencySettingsModalProps) {
  const { preferences, updateCurrencyPreferences } = useUserPreferences();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [displayFormat, setDisplayFormat] = useState<'symbol' | 'code'>('symbol');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved preferences when modal opens
  useEffect(() => {
    if (show && preferences?.currencyPreferences) {
      setSelectedCurrency(preferences.currencyPreferences.primaryCurrency);
      setDisplayFormat(preferences.currencyPreferences.displayFormat);
    }
  }, [show, preferences]);

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
  };

  const handleFormatChange = (format: 'symbol' | 'code') => {
    setDisplayFormat(format);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateCurrencyPreferences({
        primaryCurrency: selectedCurrency,
        displayFormat,
      });

      onHide();
    } catch (error) {
      console.error('Error saving currency settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencyDisplay = (currency: CurrencyOption) => {
    if (displayFormat === 'symbol') {
      return `${currency.symbol} ${currency.code}`;
    }
    return currency.code;
  };

  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex={-1} style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-currency-exchange me-2"></i>
              Currency Preferences
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <p className="text-secondary mb-4">
              Choose your preferred currency for displaying prices and portfolio values.
            </p>

            {/* Primary Currency Selection */}
            <div className="mb-4">
              <h6 className="mb-3">Primary Currency</h6>
              <div className="row g-2">
                {currencies.map((currency) => (
                  <div key={currency.code} className="col-6">
                    <div
                      className={`card h-100 cursor-pointer ${selectedCurrency === currency.code ? 'border-primary bg-light' : 'border-secondary'}`}
                      onClick={() => handleCurrencyChange(currency.code)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center p-3">
                        <div className="fs-4 mb-1">{currency.symbol}</div>
                        <div className="fw-bold small">{currency.code}</div>
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

            {/* Display Format */}
            <div className="mb-4">
              <h6 className="mb-3">Display Format</h6>
              <div className="d-flex gap-3">
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

            {/* Preview */}
            <div className="mb-4">
              <h6 className="mb-3">Preview</h6>
              <div className="alert alert-light">
                <div className="row">
                  <div className="col-6">
                    <strong>Portfolio Value:</strong><br />
                    {getCurrencyDisplay(currencies.find(c => c.code === selectedCurrency)!)} 12,345.67
                  </div>
                  <div className="col-6">
                    <strong>Bitcoin Price:</strong><br />
                    {getCurrencyDisplay(currencies.find(c => c.code === selectedCurrency)!)} 58,750.25
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Note:</strong> Currency preferences are saved to your account and will be applied across all your devices.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
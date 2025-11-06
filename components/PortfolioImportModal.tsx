'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { showSuccess, showError, showLoading, showPromise } from '@/lib/toast';

interface PortfolioImportModalProps {
  show: boolean;
  onHide: () => void;
  onImportComplete?: () => void;
}

interface ImportHolding {
  token: string;
  amount: number;
  avgPrice: number;
  exchange?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  holdings: ImportHolding[];
}

export default function PortfolioImportModal({ show, onHide, onImportComplete }: PortfolioImportModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'csv' | 'manual' | 'json'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState('');
  const [manualHoldings, setManualHoldings] = useState<ImportHolding[]>([
    { token: '', amount: 0, avgPrice: 0 }
  ]);
  const [isImporting, setIsImporting] = useState(false);

  const resetForm = () => {
    setCsvFile(null);
    setJsonData('');
    setManualHoldings([{ token: '', amount: 0, avgPrice: 0 }]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      showError('Please select a CSV file');
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch('/api/portfolio/import', {
        method: 'POST',
        body: formData
      });

      const result: ImportResult = await response.json();

      if (result.success) {
        showSuccess(`Successfully imported ${result.imported} holdings${result.skipped > 0 ? `, skipped ${result.skipped}` : ''}`);
        onImportComplete?.();
        handleClose();
      } else {
        showError(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      showError('Failed to import portfolio');
    } finally {
      setIsImporting(false);
    }
  };

  const handleJsonImport = async () => {
    if (!jsonData.trim()) {
      showError('Please enter JSON data');
      return;
    }

    setIsImporting(true);

    try {
      const parsedData = JSON.parse(jsonData);

      const response = await fetch('/api/portfolio/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedData)
      });

      const result: ImportResult = await response.json();

      if (result.success) {
        showSuccess(`Successfully imported ${result.imported} holdings${result.skipped > 0 ? `, skipped ${result.skipped}` : ''}`);
        onImportComplete?.();
        handleClose();
      } else {
        showError(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      showError('Invalid JSON format or import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualImport = async () => {
    const validHoldings = manualHoldings.filter(h =>
      h.token.trim() && h.amount > 0 && h.avgPrice > 0
    );

    if (validHoldings.length === 0) {
      showError('Please add at least one valid holding');
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch('/api/portfolio/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ holdings: validHoldings })
      });

      const result: ImportResult = await response.json();

      if (result.success) {
        showSuccess(`Successfully imported ${result.imported} holdings${result.skipped > 0 ? `, skipped ${result.skipped}` : ''}`);
        onImportComplete?.();
        handleClose();
      } else {
        showError(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      showError('Failed to import portfolio');
    } finally {
      setIsImporting(false);
    }
  };

  const addManualHolding = () => {
    setManualHoldings([...manualHoldings, { token: '', amount: 0, avgPrice: 0 }]);
  };

  const updateManualHolding = (index: number, field: keyof ImportHolding, value: string | number) => {
    const updated = [...manualHoldings];
    updated[index] = { ...updated[index], [field]: value };
    setManualHoldings(updated);
  };

  const removeManualHolding = (index: number) => {
    if (manualHoldings.length > 1) {
      setManualHoldings(manualHoldings.filter((_, i) => i !== index));
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Import Portfolio</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>

          <div className="modal-body">
            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'csv' ? 'active' : ''}`}
                  onClick={() => setActiveTab('csv')}
                >
                  CSV Import
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'manual' ? 'active' : ''}`}
                  onClick={() => setActiveTab('manual')}
                >
                  Manual Entry
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'json' ? 'active' : ''}`}
                  onClick={() => setActiveTab('json')}
                >
                  JSON Import
                </button>
              </li>
            </ul>

            {/* CSV Import Tab */}
            {activeTab === 'csv' && (
              <div>
                <div className="mb-3">
                  <label className="form-label">Select CSV File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <div className="form-text">
                    CSV should contain columns: Token/Symbol, Amount/Quantity, Price/Avg Cost
                  </div>
                </div>

                {csvFile && (
                  <div className="alert alert-info">
                    <strong>Selected:</strong> {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}

                <div className="alert alert-light">
                  <h6>Expected CSV Format:</h6>
                  <pre className="mb-0 small">
{`Token,Amount,Price,Exchange
BTC,0.5,45000,Binance
ETH,10,2800,Coinbase
ADA,2500,1.05,Binance`}
                  </pre>
                </div>
              </div>
            )}

            {/* Manual Entry Tab */}
            {activeTab === 'manual' && (
              <div>
                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mb-3"
                    onClick={addManualHolding}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Holding
                  </button>
                </div>

                {manualHoldings.map((holding, index) => (
                  <div key={index} className="row g-2 mb-3 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label">Token</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="BTC"
                        value={holding.token}
                        onChange={(e) => updateManualHolding(index, 'token', e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0.00"
                        step="0.00000001"
                        value={holding.amount || ''}
                        onChange={(e) => updateManualHolding(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Avg Price</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0.00"
                        step="0.01"
                        value={holding.avgPrice || ''}
                        onChange={(e) => updateManualHolding(index, 'avgPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => removeManualHolding(index)}
                        disabled={manualHoldings.length === 1}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* JSON Import Tab */}
            {activeTab === 'json' && (
              <div>
                <div className="mb-3">
                  <label className="form-label">JSON Data</label>
                  <textarea
                    className="form-control"
                    rows={10}
                    placeholder={`{
  "holdings": [
    {
      "token": "BTC",
      "amount": 0.5,
      "avgPrice": 45000,
      "exchange": "Binance"
    },
    {
      "token": "ETH",
      "amount": 10,
      "avgPrice": 2800
    }
  ]
}`}
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                  />
                  <div className="form-text">
                    Enter portfolio data in JSON format with holdings array
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>

            {activeTab === 'csv' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCsvImport}
                disabled={!csvFile || isImporting}
              >
                {isImporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Importing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload me-2"></i>
                    Import CSV
                  </>
                )}
              </button>
            )}

            {activeTab === 'manual' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleManualImport}
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Importing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Import Holdings
                  </>
                )}
              </button>
            )}

            {activeTab === 'json' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleJsonImport}
                disabled={!jsonData.trim() || isImporting}
              >
                {isImporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Importing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-code-slash me-2"></i>
                    Import JSON
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
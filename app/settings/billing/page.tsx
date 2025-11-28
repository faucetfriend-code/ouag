'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

const paymentMethods = [
  {
    id: 'pm_1',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  },
  {
    id: 'pm_2',
    type: 'card',
    last4: '8888',
    brand: 'mastercard',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false
  }
];

const invoices = [
  {
    id: 'inv_001',
    date: '2024-11-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Premium',
    downloadUrl: '#',
    paymentMethod: 'Visa ****4242'
  },
  {
    id: 'inv_002',
    date: '2024-10-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Premium',
    downloadUrl: '#',
    paymentMethod: 'Visa ****4242'
  },
  {
    id: 'inv_003',
    date: '2024-09-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Premium',
    downloadUrl: '#',
    paymentMethod: 'Mastercard ****8888'
  },
  {
    id: 'inv_004',
    date: '2024-08-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Premium',
    downloadUrl: '#',
    paymentMethod: 'Mastercard ****8888'
  }
];

export default function BillingPage() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h1 className="mb-3">Billing & Payments</h1>
          <p className="text-secondary mb-4">Please log in to manage your billing information.</p>
          <Link href="/login" className="btn btn-primary">
            <i className="bi bi-discord me-2"></i>
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  const handleAddPaymentMethod = async () => {
    setIsProcessing(true);
    try {
      // TODO: Integrate with Stripe Elements
      console.log('Adding payment method...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Payment method management will be available once Stripe integration is complete.');
    } catch (error) {
      alert('Error adding payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Integrate with Stripe
      console.log(`Removing payment method: ${paymentMethodId}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Payment method removed successfully!');
    } catch (error) {
      alert('Error removing payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    setIsProcessing(true);
    try {
      // TODO: Integrate with Stripe
      console.log(`Setting default payment method: ${paymentMethodId}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Default payment method updated successfully!');
    } catch (error) {
      alert('Error updating default payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'bi-credit-card-2-front';
      case 'mastercard':
        return 'bi-credit-card-2-front';
      case 'amex':
        return 'bi-credit-card-2-front';
      default:
        return 'bi-credit-card';
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
            Billing & Payments
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Billing & Payments</h1>
        <p className="text-secondary mb-0">Manage your payment methods and view billing history</p>
      </div>

      <div className="row">
        {/* Payment Methods */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Payment Methods</h5>
            </div>
            <div className="card-body">
              {paymentMethods.length === 0 ? (
                <div className="text-center text-secondary py-4">
                  <i className="bi bi-credit-card display-4 mb-3 d-block"></i>
                  <p className="mb-3">No payment methods saved</p>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddPaymentMethod}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Payment Method
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <i className={`bi ${getCardIcon(method.brand)} fs-4 me-3 text-primary`}></i>
                              <div>
                                <div className="fw-bold">
                                  {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ****{method.last4}
                                  {method.isDefault && (
                                    <span className="badge bg-primary ms-2">Default</span>
                                  )}
                                </div>
                                <small className="text-secondary">
                                  Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                                </small>
                              </div>
                            </div>
                            <div className="btn-group" role="group">
                              {!method.isDefault && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                  disabled={isProcessing}
                                  title="Set as default"
                                >
                                  <i className="bi bi-star"></i>
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemovePaymentMethod(method.id)}
                                disabled={isProcessing}
                                title="Remove"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={handleAddPaymentMethod}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Add New Payment Method
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Billing Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Billing Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={user.email || ''}
                  readOnly
                />
                <small className="text-secondary">
                  Billing emails are sent to your account email address.
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">Billing Address</label>
                <div className="text-center text-secondary py-3">
                  <i className="bi bi-geo-alt display-4 mb-2 d-block"></i>
                  <p className="mb-0">No billing address saved</p>
                  <small>Billing address management will be available once Stripe integration is complete.</small>
                </div>
                <button className="btn btn-outline-primary w-100" disabled>
                  <i className="bi bi-geo-alt me-2"></i>
                  Add Billing Address
                </button>
              </div>

              <div className="mb-0">
                <label className="form-label">Tax Information</label>
                <div className="text-center text-secondary py-3">
                  <i className="bi bi-receipt display-4 mb-2 d-block"></i>
                  <p className="mb-0">No tax information saved</p>
                  <small>Tax information is automatically collected for applicable regions.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Billing History</h5>
            </div>
            <div className="card-body">
              {invoices.length === 0 ? (
                <div className="text-center text-secondary py-4">
                  <i className="bi bi-receipt display-4 mb-3 d-block"></i>
                  <p className="mb-0">No billing history available</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Payment Method</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>{new Date(invoice.date).toLocaleDateString()}</td>
                          <td>
                            <div>
                              <div className="fw-bold">{invoice.plan} Plan</div>
                              <small className="text-secondary">Invoice #{invoice.id}</small>
                            </div>
                          </td>
                          <td>{invoice.paymentMethod}</td>
                          <td className="fw-bold">{formatCurrency(invoice.amount)}</td>
                          <td>
                            <span className={`badge ${invoice.status === 'paid' ? 'bg-success' : invoice.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-eye me-1"></i>
                                View
                              </button>
                              <button className="btn btn-sm btn-outline-secondary">
                                <i className="bi bi-download me-1"></i>
                                Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="text-center">
            <small className="text-secondary">
              Need help with billing?{' '}
              <Link href="/settings/subscription" className="text-primary text-decoration-none">
                Manage your subscription
              </Link>{' '}
              or{' '}
              <button className="btn btn-link btn-sm p-0 text-primary text-decoration-none">
                contact support
              </button>
              .
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
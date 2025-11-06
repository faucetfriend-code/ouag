'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  current?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Basic market data',
      'Limited analyst insights',
      'Community access',
      'Email notifications',
      'Mobile app access'
    ],
    current: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    interval: 'month',
    features: [
      'All Free features',
      'Unlimited analyst insights',
      'Real-time price alerts',
      'Advanced charting tools',
      'Priority support',
      'API access',
      'Custom notifications'
    ],
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    interval: 'month',
    features: [
      'All Premium features',
      'Institutional-grade data',
      'Custom analytics',
      'White-label solutions',
      'Dedicated account manager',
      'Advanced API limits',
      'Custom integrations'
    ]
  }
];

const billingHistory = [
  {
    id: 'inv_001',
    date: '2024-11-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Premium',
    downloadUrl: '#'
  },
  {
    id: 'inv_002',
    date: '2024-10-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Premium',
    downloadUrl: '#'
  },
  {
    id: 'inv_003',
    date: '2024-09-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Premium',
    downloadUrl: '#'
  }
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h1 className="mb-3">Subscription Management</h1>
          <p className="text-secondary mb-4">Please log in to manage your subscription.</p>
          <Link href="/login" className="btn btn-primary">
            <i className="bi bi-discord me-2"></i>
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);
    try {
      // TODO: Integrate with Stripe/Payment processor
      console.log(`Subscribing to plan: ${planId}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      alert(`Subscription to ${planId} plan initiated! (Integration with payment processor needed)`);
    } catch (error) {
      alert('Error processing subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Integrate with Stripe/Payment processor
      console.log('Cancelling subscription...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      alert('Subscription cancelled successfully! (Integration with payment processor needed)');
    } catch (error) {
      alert('Error cancelling subscription');
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

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount for yearly
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
            Subscription
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Subscription Management</h1>
        <p className="text-secondary mb-0">Manage your subscription plan and billing information</p>
      </div>

      {/* Current Subscription Status */}
      <div className="row mb-4">
        <div className="col-12">
          <div className={`card ${user.subscription?.active ? 'border-success' : 'border-warning'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-1">
                    <i className={`bi ${user.subscription?.active ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'} me-2`}></i>
                    {user.subscription?.active ? `${user.subscription.plan} Plan Active` : 'No Active Subscription'}
                  </h5>
                  {user.subscription?.active && user.subscription.endDate && (
                    <p className="text-secondary mb-1">
                      Next billing date: {new Date(user.subscription.endDate).toLocaleDateString()}
                    </p>
                  )}
                  {user.subscription?.active && (
                    <p className="text-secondary mb-0">
                      Enjoy unlimited access to premium features and analyst insights.
                    </p>
                  )}
                  {!user.subscription?.active && (
                    <p className="text-secondary mb-0">
                      Upgrade to access premium features and unlock the full potential of Unity Oracle.
                    </p>
                  )}
                </div>
                <div>
                  {user.subscription?.active ? (
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary">
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Upgrade Plan
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={handleCancelSubscription}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        ) : (
                          <i className="bi bi-x-circle me-2"></i>
                        )}
                        Cancel Subscription
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-primary">
                      <i className="bi bi-star me-2"></i>
                      Upgrade Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Subscription Plans */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Choose Your Plan</h5>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${billingInterval === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setBillingInterval('month')}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${billingInterval === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setBillingInterval('year')}
                  >
                    Yearly
                    <span className="badge bg-success ms-1">Save 20%</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {subscriptionPlans.map((plan) => (
                  <div key={plan.id} className="col-md-4">
                    <div className={`card h-100 ${plan.popular ? 'border-primary' : ''} ${plan.current ? 'border-success' : ''}`}>
                      {plan.popular && (
                        <div className="card-header bg-primary text-white text-center">
                          <small className="fw-bold">MOST POPULAR</small>
                        </div>
                      )}
                      {plan.current && (
                        <div className="card-header bg-success text-white text-center">
                          <small className="fw-bold">CURRENT PLAN</small>
                        </div>
                      )}
                      <div className="card-body text-center">
                        <h4 className="card-title">{plan.name}</h4>
                        <div className="mb-3">
                          <span className="h2 text-primary fw-bold">
                            {billingInterval === 'year' && plan.price > 0
                              ? formatCurrency(getYearlyPrice(plan.price))
                              : formatCurrency(plan.price)
                            }
                          </span>
                          <small className="text-secondary d-block">
                            per {billingInterval}
                            {billingInterval === 'year' && plan.price > 0 && (
                              <span className="text-success fw-bold"> (Save 20%)</span>
                            )}
                          </small>
                        </div>
                        <ul className="list-unstyled mb-4">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="mb-2">
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              <small>{feature}</small>
                            </li>
                          ))}
                        </ul>
                        <button
                          className={`btn w-100 ${plan.current ? 'btn-success' : plan.popular ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={plan.current || isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Processing...
                            </>
                          ) : plan.current ? (
                            'Current Plan'
                          ) : (
                            `Choose ${plan.name}`
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Billing History */}
          {user.subscription?.active && (
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">Billing History</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Plan</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>{new Date(invoice.date).toLocaleDateString()}</td>
                          <td>{invoice.plan}</td>
                          <td>{formatCurrency(invoice.amount)}</td>
                          <td>
                            <span className={`badge ${invoice.status === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-download me-1"></i>
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Payment Methods */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Payment Methods</h6>
            </div>
            <div className="card-body">
              <div className="text-center text-secondary py-4">
                <i className="bi bi-credit-card display-4 mb-3 d-block"></i>
                <p className="mb-2">No payment methods saved</p>
                <small>Payment method management will be available once Stripe integration is complete.</small>
              </div>
              <button className="btn btn-outline-primary w-100" disabled>
                <i className="bi bi-plus-circle me-2"></i>
                Add Payment Method
              </button>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Usage This Month</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small>Analyst Insights</small>
                  <small className="fw-bold">247 / 500</small>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-primary" style={{ width: '49.4%' }}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small>API Calls</small>
                  <small className="fw-bold">1,234 / 10,000</small>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-success" style={{ width: '12.34%' }}></div>
                </div>
              </div>
              <div className="mb-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small>Notifications</small>
                  <small className="fw-bold">89 / 200</small>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-warning" style={{ width: '44.5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="card">
            <div className="card-body text-center">
              <i className="bi bi-headset display-4 text-primary mb-3"></i>
              <h6>Need Help?</h6>
              <p className="small text-secondary mb-3">
                Questions about your subscription or billing?
              </p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-chat-dots me-2"></i>
                  Contact Support
                </button>
                <Link href="/settings" className="btn btn-outline-secondary btn-sm">
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
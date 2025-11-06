'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h1 className="mb-3">Settings</h1>
          <p className="text-secondary mb-4">Please log in to access your settings.</p>
          <Link href="/login" className="btn btn-primary">
            <i className="bi bi-discord me-2"></i>
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: 'Account & Security',
      description: 'Manage your account settings and security preferences',
      icon: 'bi-person-gear',
      items: [
        { href: '/settings/security', label: 'Security Settings', icon: 'bi-shield-check', description: 'Password, 2FA, and account security' },
        { href: '/settings/profile', label: 'Profile Information', icon: 'bi-person-circle', description: 'Update your profile details' },
      ]
    },
    {
      title: 'Preferences',
      description: 'Customize your trading and notification preferences',
      icon: 'bi-sliders',
      items: [
        { href: '/settings/notifications', label: 'Notifications', icon: 'bi-bell', description: 'Configure notification preferences' },
        { href: '/settings/currency', label: 'Currency & Display', icon: 'bi-currency-exchange', description: 'Set your preferred currency and display options' },
        { href: '/settings/trading', label: 'Trading Preferences', icon: 'bi-graph-up', description: 'Risk tolerance and trading settings' },
      ]
    },
    {
      title: 'Billing & Subscription',
      description: 'Manage your subscription and billing information',
      icon: 'bi-credit-card',
      items: [
        { href: '/settings/subscription', label: 'Subscription Management', icon: 'bi-star', description: 'View and manage your subscription plan' },
        { href: '/settings/billing', label: 'Billing & Payments', icon: 'bi-receipt', description: 'Payment methods and billing history' },
      ]
    },
    {
      title: 'Data & Privacy',
      description: 'Manage your data and privacy settings',
      icon: 'bi-shield-lock',
      items: [
        { href: '/settings/privacy', label: 'Privacy Settings', icon: 'bi-eye-slash', description: 'Control your data and privacy' },
        { href: '/settings/data', label: 'Data Management', icon: 'bi-database', description: 'Export or delete your data' },
      ]
    }
  ];

  return (
    <div className="container mt-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Settings
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Settings</h1>
        <p className="text-secondary mb-0">Manage your account preferences and application settings</p>
      </div>

      <div className="row">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className={`bi ${section.icon} me-2`}></i>
                  {section.title}
                </h5>
              </div>
              <div className="card-body">
                <p className="text-secondary small mb-3">{section.description}</p>
                <div className="d-grid gap-2">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className="btn btn-outline-primary text-start"
                    >
                      <div className="d-flex align-items-center">
                        <i className={`bi ${item.icon} me-2`}></i>
                        <div>
                          <div className="fw-bold">{item.label}</div>
                          <small className="text-secondary">{item.description}</small>
                        </div>
                        <i className="bi bi-chevron-right ms-auto"></i>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <Link href="/profile" className="btn btn-outline-secondary w-100">
                    <i className="bi bi-person me-2"></i>
                    View Profile
                  </Link>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-outline-warning w-100">
                    <i className="bi bi-download me-2"></i>
                    Export Data
                  </button>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-outline-danger w-100">
                    <i className="bi bi-trash me-2"></i>
                    Delete Account
                  </button>
                </div>
                <div className="col-md-3">
                  <Link href="/" className="btn btn-outline-primary w-100">
                    <i className="bi bi-house me-2"></i>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
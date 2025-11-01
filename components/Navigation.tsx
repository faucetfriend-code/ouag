'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: 'bi-house' },
    { href: '/profile', label: 'Profile', icon: 'bi-person' },
    { href: '/tools', label: 'Tools', icon: 'bi-tools' },
    { href: '/analysts', label: 'Analysts', icon: 'bi-graph-up' }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-currency-bitcoin me-2"></i>
          <span className="fw-bold">Unity Oracle</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {navItems.map((item) => (
              <li key={item.href} className="nav-item">
                <Link
                  href={item.href}
                  className={`nav-link d-flex align-items-center ${
                    isActive(item.href) ? 'active fw-bold' : ''
                  }`}
                >
                  <i className={`bi ${item.icon} me-1`}></i>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
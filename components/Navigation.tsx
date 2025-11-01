/**
 * Navigation Component
 *
 * Responsive navigation bar with active page highlighting.
 * Provides links to all main sections of the application.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  // Get current route for active link highlighting
  const pathname = usePathname();

  // Navigation menu items configuration
  const navItems = [
    { href: '/', label: 'Home', icon: 'bi-house' },
    { href: '/profile', label: 'Profile', icon: 'bi-person' },
    { href: '/tools', label: 'Tools', icon: 'bi-tools' },
    { href: '/analysts', label: 'Analysts', icon: 'bi-graph-up' }
  ];

  // Check if a navigation item should be marked as active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';  // Exact match for home
    }
    return pathname.startsWith(href);  // Prefix match for other routes
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        {/* BRAND LOGO: Clickable link back to home */}
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-currency-bitcoin me-2"></i>
          <span className="fw-bold">Unity Oracle</span>
        </Link>

        {/* MOBILE TOGGLE BUTTON: Collapses/expands nav on small screens */}
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

        {/* NAVIGATION MENU: Responsive collapsible menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {navItems.map((item) => (
              <li key={item.href} className="nav-item">
                <Link
                  href={item.href}
                  className={`nav-link d-flex align-items-center ${
                    isActive(item.href) ? 'active fw-bold' : ''  // Highlight active page
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
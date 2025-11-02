/**
 * Navigation Component
 *
 * Mobile-optimized responsive navigation bar with active page highlighting.
 * Features React-managed hamburger menu without Bootstrap JS dependencies.
 * Provides links to all main sections of the application with accessibility support.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  // Get current route for active link highlighting
  const pathname = usePathname();

  // Mobile menu state (React-managed, no Bootstrap JS required)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation menu items configuration
  const navItems = [
    { href: '/', label: 'Home', icon: 'bi-house' },
    { href: '/profile', label: 'Profile', icon: 'bi-person' },
    { href: '/tools', label: 'Tools', icon: 'bi-tools' },
    { href: '/analysts', label: 'Analysts', icon: 'bi-graph-up' }
  ];

  // Check if a navigation item should be marked as active
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') {
      return pathname === '/';  // Exact match for home
    }
    return pathname.startsWith(href);  // Prefix match for other routes
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.navbar')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="container">
        {/* BRAND LOGO: Clickable link back to home */}
        <Link href="/" className="navbar-brand d-flex align-items-center" aria-label="Unity Oracle Home">
          <i className="bi bi-currency-bitcoin me-2" aria-hidden="true"></i>
          <span className="fw-bold">Unity Oracle</span>
        </Link>

        {/* MOBILE TOGGLE BUTTON: React-managed hamburger menu */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-controls="navbarNav"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* NAVIGATION MENU: Responsive collapsible menu with smooth transitions */}
        <div
          className={`navbar-collapse ${isMobileMenuOpen ? 'show' : 'collapse'}`}
          id="navbarNav"
          style={{
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <ul className="navbar-nav ms-auto" role="menubar">
            {navItems.map((item) => (
              <li key={item.href} className="nav-item" role="none">
                <Link
                  href={item.href}
                  className={`nav-link d-flex align-items-center ${
                    isActive(item.href) ? 'active fw-bold' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  role="menuitem"
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <i className={`bi ${item.icon} me-1`} aria-hidden="true"></i>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* MOBILE OVERLAY: Darkens background when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{
            opacity: 0.5,
            zIndex: 1040,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
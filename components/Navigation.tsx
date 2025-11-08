/**
 * Navigation Component
 *
 * Mobile-optimized responsive navigation bar with active page highlighting.
 * Features React-managed hamburger menu without Bootstrap JS dependencies.
 * Enhanced with swipe gestures for mobile: edge swipe to open menu.
 * Provides links to all main sections of the application with accessibility support.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGesture } from '@use-gesture/react';
import { lightImpact } from '../lib/haptics';
import { Bell } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);

  // Get current route for active link highlighting
  const pathname = usePathname();

  // Mobile menu state (React-managed, no Bootstrap JS required)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);

  // Notification center state
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Navigation menu items configuration
  const navItems = [
    { href: '/', label: 'Home', icon: 'bi-house' },
    { href: '/profile', label: 'Profile', icon: 'bi-person' },
    { href: '/tools', label: 'Tools', icon: 'bi-tools' },
    { href: '/analysts', label: 'Analysts', icon: 'bi-graph-up' },
    { href: '/settings', label: 'Settings', icon: 'bi-gear' }
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
  // Note: This is a valid synchronization effect with routing state
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/history?unreadOnly=true&limit=1');
        if (response.ok) {
          const data = await response.json();
          setUnreadNotificationCount(data.totalCount);
        }
      } catch (error) {
        console.error('Failed to fetch unread notification count:', error);
      }
    };

    fetchUnreadCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Edge swipe gesture for mobile menu
  const bind = useGesture({
    onDrag: ({ active, movement: [mx], velocity: [vx] }) => {
      // Only allow swipe from left edge (within 20px of screen edge)
      if (mx < 0) return; // Only allow rightward swipes from left edge

      const progress = Math.max(0, Math.min(1, mx / 300));
      setSwipeProgress(progress);

      if (!active && progress > 0.3 && vx > 0.5) {
        setIsMobileMenuOpen(true);
        lightImpact(); // Haptic feedback for menu open
      }
    },
    onDragEnd: () => {
      setSwipeProgress(0);
    },
  }, {
    drag: {
      axis: 'x',
      bounds: { left: 0, right: 300 },
      rubberband: true,
    },
  });

  return (
    <>
      {/* EDGE SWIPE DETECTOR (invisible overlay for left edge) */}
      <div
        {...bind()}
        className="edge-swipe-detector"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '20px',
          height: '100vh',
          zIndex: 1050,
          touchAction: 'none',
        }}
      />

      {/* SWIPE PROGRESS INDICATOR */}
      {swipeProgress > 0 && (
        <div
          className="swipe-progress"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: `${swipeProgress * 100}%`,
            height: '4px',
            background: 'linear-gradient(90deg, var(--primary-orange), var(--accent-yellow))',
            zIndex: 1060,
            transition: 'width 0.1s ease-out',
          }}
        />
      )}

      <nav
        ref={navRef}
        className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
      <div className="container">
        {/* BRAND LOGO: Clickable link back to home */}
        <Link href="/" className="navbar-brand d-flex align-items-center" aria-label="Unity Oracle Home">
          <i className="bi bi-currency-bitcoin me-2" aria-hidden="true"></i>
          <span className="fw-bold">Unity Oracle</span>
        </Link>

        {/* NOTIFICATION BELL: Desktop notification center toggle */}
        <div className="d-none d-lg-flex align-items-center me-3">
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="btn btn-link text-white position-relative p-2"
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                <span className="visually-hidden">unread notifications</span>
              </span>
            )}
          </button>
        </div>

        {/* MOBILE TOGGLE BUTTON: React-managed hamburger menu */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            lightImpact(); // Haptic feedback for menu toggle
          }}
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
          role="button"
          aria-label="Close navigation menu"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsMobileMenuOpen(false);
            }
          }}
        />
      )}

      {/* NOTIFICATION CENTER */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
      </nav>
    </>
  );
}
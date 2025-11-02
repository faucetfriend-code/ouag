/**
 * Toast Provider Component
 *
 * Wraps the application with react-hot-toast for global toast notifications.
 * Provides consistent styling and positioning for success, error, and info messages.
 */

'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#1a1a1a',
          color: '#fff',
          fontSize: '14px',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
        // Success toast styling
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: '#064e3b',
            color: '#fff',
            border: '1px solid #10b981',
          },
        },
        // Error toast styling
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#7f1d1d',
            color: '#fff',
            border: '1px solid #ef4444',
          },
        },
        // Loading toast styling
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
          },
          style: {
            background: '#1e3a8a',
            color: '#fff',
            border: '1px solid #3b82f6',
          },
        },
      }}
    />
  );
}

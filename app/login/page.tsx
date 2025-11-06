'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to avoid issues with NextAuth during static generation
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/profile');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <i className="bi bi-discord text-primary" style={{ fontSize: '4rem' }}></i>
                </div>

                <h2 className="card-title mb-3 text-white">Welcome to Unity Oracle</h2>
                <p className="text-secondary mb-4">
                  Connect with Discord to access premium crypto analysis and trading insights.
                </p>

                <button
                  onClick={login}
                  className="btn btn-primary btn-lg w-100 mb-3"
                  style={{ backgroundColor: '#5865F2', borderColor: '#5865F2' }}
                >
                  <i className="bi bi-discord me-2"></i>
                  Login with Discord
                </button>

                <div className="small text-secondary">
                  <p className="mb-2">
                    <i className="bi bi-shield-check me-1"></i>
                    Server membership required
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-star me-1"></i>
                    Premium subscription for full access
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <small className="text-secondary">
                By logging in, you agree to our terms of service and privacy policy.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
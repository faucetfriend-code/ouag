'use client';

import { useLoading } from '@/lib/loading-context';

export default function GlobalLoadingSpinner() {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999
      }}
    >
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-light mb-2">{loadingMessage}</h5>
        <div className="progress" style={{ width: '200px', height: '4px' }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
            role="progressbar"
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
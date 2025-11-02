'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center p-4">
            <div className="mb-4">
              <i className="bi bi-exclamation-triangle-fill text-danger display-1"></i>
            </div>
            <h2 className="text-light mb-3">Oops! Something went wrong</h2>
            <p className="text-secondary mb-4">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Page
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              >
                <i className="bi bi-house me-2"></i>
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-start">
                <summary className="text-warning cursor-pointer">
                  <small>Development Error Details</small>
                </summary>
                <pre className="mt-2 p-3 bg-dark text-danger small border rounded">
                  <code>{this.state.error.toString()}</code>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2">
                      <strong>Component Stack:</strong>
                      <br />
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
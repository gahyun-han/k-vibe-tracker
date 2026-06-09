'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Sentry로 에러 전송 (Sprint 2에서 연동)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center p-8 text-center">
          <div className="space-y-4">
            <p className="text-5xl">😵</p>
            <h2 className="text-white font-bold text-xl">Something went wrong</h2>
            <p className="text-[#8B8BA8] text-sm">An unexpected error occurred. Please try again.</p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="text-left bg-[#1E1E30] text-red-400 text-xs p-4 rounded-xl overflow-auto max-w-sm">
                {this.state.error?.message}
              </pre>
            )}
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-6 py-3 bg-[#FF3A5C] text-white font-bold rounded-2xl"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

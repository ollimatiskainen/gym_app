'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-sm bg-bg-secondary p-8 card-depth">
            <h2 className="mb-2 text-xl font-bold text-text-primary">Something went wrong</h2>
            <p className="mb-4 text-sm text-text-secondary">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-6 py-3 font-semibold text-text-on-accent active:scale-95"
            >
              <RefreshCw size={18} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

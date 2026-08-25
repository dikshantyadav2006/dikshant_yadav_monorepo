'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RuntimeErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[CodeBlock Runtime Error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="text-destructive text-xs font-bold mb-1">Runtime Error</div>
          <div className="text-destructive/80 text-[11px] font-mono whitespace-pre-wrap">
            {this.state.error?.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

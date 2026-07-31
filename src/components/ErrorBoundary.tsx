import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md mb-6">
            An unexpected error occurred in the application. Our team has been notified.
          </p>
          {this.state.error && (
            <div className="bg-muted/50 p-4 rounded-xl text-left text-sm text-muted-foreground w-full max-w-2xl overflow-auto mb-6">
              <code>{this.state.error.toString()}</code>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

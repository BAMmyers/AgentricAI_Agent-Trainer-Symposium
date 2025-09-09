
import React from 'react';
import ErrorAnalysis from './ErrorAnalysis';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }
  
  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // You can render any custom fallback UI
      return (
        <ErrorAnalysis
          error={this.state.error}
          componentStack={this.state.errorInfo.componentStack}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

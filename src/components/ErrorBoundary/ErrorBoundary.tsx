import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from './ErrorPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  stack: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      message: '오류 정보 없음',
      stack: '스택 정보 없음',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    const message = error.message;
    const stack = error.stack ? error.stack : '스택 정보 없음';
    return { hasError: true, message: message, stack: stack };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorPage message={this.state.message} stack={this.state.stack} />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

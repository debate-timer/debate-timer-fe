import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import ErrorPage from './ErrorPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error;
  stack: string;
}

const defaultError = new Error('알 수 없는 오류');
const defaultStack = '스택 정보 없음';

type SentryCapturedError = {
  __sentry_captured__?: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: defaultError,
      stack: defaultStack,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    const stack = error.stack === undefined ? defaultStack : error.stack;
    return { hasError: true, error: error, stack: stack };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 이미 API 인터셉터 등에서 캡처된 에러가 아니라면 전송
    if (!(error as SentryCapturedError).__sentry_captured__) {
      Sentry.captureException(error, {
        tags: {
          errorType: 'render-error',
        },
        extra: {
          pathname: window.location.pathname,
          search: window.location.search,
          componentStack: errorInfo.componentStack,
        },
      });
    }

    console.log(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: defaultError,
      stack: defaultStack,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorPage
          error={this.state.error}
          stack={this.state.stack}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

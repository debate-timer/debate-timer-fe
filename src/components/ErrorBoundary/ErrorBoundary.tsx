import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import ErrorPage from './ErrorPage';
import {
  createSentryRenderError,
  isSentryCaptured,
  resolveFeatureFromPathname,
  sanitizeSentrySearch,
} from '../../util/sentry';

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
    // API 인터셉터에서 이미 커스텀 이벤트로 전송한 에러는 전역 beforeSend에서도 drop된다.
    // ErrorBoundary에서는 아직 수집되지 않은 렌더링 에러만 render-error로 전송한다.
    if (!isSentryCaptured(error)) {
      const feature = resolveFeatureFromPathname(window.location.pathname);
      const sentryError = createSentryRenderError(error, feature);

      Sentry.withScope((scope) => {
        scope.setLevel('fatal');
        scope.setTags({
          errorType: 'render-error',
          feature,
        });
        scope.setContext('render', {
          pathname: window.location.pathname,
          search: sanitizeSentrySearch(window.location.search),
          errorName: error.name,
          errorMessage: error.message,
          componentStack: errorInfo.componentStack,
        });
        scope.setFingerprint(['render-error', feature]);

        Sentry.captureException(sentryError);
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

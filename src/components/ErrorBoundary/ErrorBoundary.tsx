import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from './ErrorPage';
import { AxiosError } from 'axios';
import { ErrorResponseType } from '../../apis/responseTypes';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  stack: string;
}

const defaultMessage = '오류 정보 없음';
const defaultStack = '스택 정보 없음';

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      message: defaultMessage,
      stack: defaultStack,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    const stack = error.stack === undefined ? defaultStack : error.stack;
    let message: string;

    if (error instanceof AxiosError && error.response) {
      message = (error.response.data as ErrorResponseType).message;
    } else {
      message = error.message;
    }
    return { hasError: true, message: message, stack: stack };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      message: defaultMessage,
      stack: defaultStack,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorPage
          message={this.state.message}
          stack={this.state.stack}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

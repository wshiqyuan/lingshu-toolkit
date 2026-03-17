import { Component, type PropsWithChildren } from 'react';

export class ErrorBoundary extends Component<PropsWithChildren<{ onError: () => void }>> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

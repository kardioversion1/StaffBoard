import React from 'react';
import { STORAGE_KEY } from '../lib/storage';

interface State { hasError: boolean; }

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('[StaffBoard] Uncaught', { error, info });
  }

  resetStorage() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-overlay">
          <p>Something went wrong. Details in console.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
          <button onClick={() => this.resetStorage()}>Reset Local Data</button>
        </div>
      );
    }
    return this.props.children;
  }
}

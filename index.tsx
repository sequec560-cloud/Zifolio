import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          color: '#e5e5e5', 
          backgroundColor: '#050505', 
          minHeight: '100vh', 
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#f09805' }}>Something went wrong</h1>
          <p style={{ maxWidth: '600px', color: '#999', marginBottom: '24px' }}>
            The application encountered an unexpected error. Please try reloading.
          </p>
          <div style={{ 
            backgroundColor: '#111', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '24px', 
            maxWidth: '80%', 
            overflow: 'auto',
            border: '1px solid #333',
            color: '#f87171',
            textAlign: 'left'
          }}>
            <code style={{ fontSize: '12px' }}>{this.state.error?.message || 'Unknown error'}</code>
          </div>
          <button 
            onClick={() => {
              localStorage.clear(); // Clear storage as it might be the cause
              window.location.reload();
            }} 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#f09805', 
              color: '#000', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Clear Data & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
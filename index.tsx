import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

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
          color: '#1e293b', 
          backgroundColor: '#f9f9fd', 
          minHeight: '100vh', 
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#6384ff', fontWeight: 'bold' }}>Algo deu errado</h1>
          <p style={{ maxWidth: '500px', color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
            A aplicação encontrou um erro inesperado. Por favor, tente recarregar a página.
          </p>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '24px', 
            borderRadius: '16px', 
            marginBottom: '32px', 
            maxWidth: '90%', 
            width: '600px',
            overflow: 'auto',
            border: '1px solid #e2e8f0',
            color: '#ef4444',
            textAlign: 'left',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#94a3b8', textTransform: 'uppercase' }}>Detalhes do Erro:</p>
            <code style={{ fontSize: '14px', fontFamily: 'monospace' }}>{this.state.error?.message || 'Erro desconhecido'}</code>
          </div>
          <button 
            onClick={() => {
              localStorage.clear(); // Clear storage as it might be the cause
              window.location.reload();
            }} 
            style={{ 
              padding: '14px 32px', 
              backgroundColor: '#6384ff', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 10px 15px -3px rgba(99, 132, 255, 0.2)'
            }}
          >
            Limpar Dados & Recarregar
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
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
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
        <div className="min-h-screen bg-[#f9f9fd] flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-[#6384ff] mb-4">Algo deu errado</h1>
          <p className="text-slate-500 max-w-md mb-8">
            A aplicação encontrou um erro inesperado. Tente recarregar a página.
          </p>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg max-w-xl w-full mb-8 text-left overflow-auto">
             <p className="text-xs font-bold text-slate-400 uppercase mb-2">Detalhes do Erro</p>
             <code className="text-sm font-mono text-red-500">{this.state.error?.message}</code>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="bg-[#6384ff] hover:bg-[#4f46e5] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-[#6384ff]/20 transition-all"
          >
            Limpar Dados e Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
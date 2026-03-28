import React, { ReactNode } from 'react';
import { AlertCircle } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full">
            <div className="flex justify-center mb-4">
              <AlertCircle className="text-red-500" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Oops! Algo deu errado</h1>
            <p className="text-gray-600 text-center mb-4">
              Ocorreu um erro ao carregar esta página.
            </p>
            <details className="bg-gray-100 p-3 rounded mb-4 text-sm">
              <summary className="cursor-pointer font-semibold mb-2">Detalhes do erro</summary>
              <pre className="text-xs overflow-auto bg-white p-2 rounded mt-2 border">
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </details>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Recarregar página
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
              >
                Voltar atrás
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

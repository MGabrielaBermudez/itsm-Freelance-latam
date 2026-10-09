import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/** Captura errores de render en la vista y ofrece una salida clara. */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="error-boundary">
        <div className="error-boundary__panel">
          <h2>Ups, algo salió mal</h2>
          <p className="state__desc">
            Se ha producido un error inesperado al pintar esta sección. Puedes reintentarlo o
            recargar la página.
          </p>
          {this.state.error && (
            <p className="state__desc mono">{this.state.error.message}</p>
          )}
          <div className="error-boundary__actions">
            <button type="button" className="btn btn--primary" onClick={this.handleReset}>
              Reintentar
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    );
  }
}
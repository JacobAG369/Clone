import React from 'react';

/**
 * @class ErrorBoundary
 * @description Componente de límite de error (Error Boundary) para capturar fallos de renderizado
 * en vistas complejas como mapas interactivos, paneles de administración o componentes dinámicos.
 * Previene el colapso total de la aplicación React y muestra una interfaz amigable para recuperación.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🛑 ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 my-4 shadow-sm">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              ⚠️
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Ha ocurrido un error inesperado
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Esta sección no se pudo renderizar correctamente. Puede deberse a un problema temporal de conexión o a un fallo en los datos recibidos.
              </p>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="bg-slate-800 text-red-300 p-3 rounded-lg text-xs text-left overflow-auto max-h-40 font-mono border border-slate-700">
                <p className="font-semibold mb-1 text-red-200">{this.state.error.toString()}</p>
                {this.state.errorInfo?.componentStack}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                🔄 Reintentar / Recargar
              </button>
              <a
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl text-sm transition-all text-center"
              >
                🏠 Volver al Inicio
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

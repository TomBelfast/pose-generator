import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { logger } from '../utils/logger';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-neu-base flex items-center justify-center p-4">
                    <div className="neu-raised max-w-md w-full p-8 text-center rounded-[var(--radius-xl)]">
                        <div className="neu-pressed inline-flex p-4 rounded-full mb-6 text-neu-danger">
                            <AlertCircle size={48} />
                        </div>

                        <h1 className="text-2xl font-bold text-neu-text mb-2">
                            Coś poszło nie tak
                        </h1>

                        <p className="text-neu-text-muted mb-8">
                            Wystąpił nieoczekiwany błąd aplikacji. Przepraszamy za niedogodności.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="neu-pressed-sm p-4 mb-6 text-left overflow-auto max-h-48 text-xs font-mono text-neu-danger bg-red-50/10">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="neu-btn neu-btn-primary w-full flex items-center justify-center gap-2 py-3"
                        >
                            <RefreshCw size={20} />
                            Odśwież stronę
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

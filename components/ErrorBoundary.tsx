import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-rose-500/20 text-center select-none min-h-[350px]">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)] animate-pulse">
                        <AlertTriangle size={28} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1.5">
                        {this.props.fallbackTitle || '3D Render Warning'}
                    </h3>
                    <p className="text-xs text-white/50 max-w-sm mb-4 leading-relaxed font-medium">
                        {this.state.error?.message || 'WebGL context loss or 3D asset initialization issue detected.'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> Reload Visualizer
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

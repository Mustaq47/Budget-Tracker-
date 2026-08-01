import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Enterprise-Grade Global Error Boundary
 * Prevents application crashes and renders an Apple & Material Design 3 recovery interface
 * adhering strictly to the /desings design system.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("coZify Uncaught Render Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleResetState = () => {
    try {
      localStorage.removeItem("budget-store");
      sessionStorage.clear();
    } catch (e) {
      console.error("Failed to clear local storage during recovery:", e);
    }
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white select-none">
          {/* Ambient background glow */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.25), transparent 60%)",
            }}
          />

          <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl rounded-[28px] p-7 flex flex-col items-center text-center">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400 mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl tracking-tighter font-black mb-2">
              Something went wrong
            </h1>
            <p className="text-sm tracking-tight text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              We prevented an unexpected issue from closing coZify. You can retry or reset your application state safely.
            </p>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3 mb-5">
              <button
                onClick={this.handleRetry}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-colors text-white font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={this.handleResetState}
                className="w-full h-11 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 active:scale-[0.98] transition-colors text-slate-700 dark:text-slate-200 font-semibold text-xs tracking-tight flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 focus:outline-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Application State
              </button>
            </div>

            {/* Collapsible Error Stack */}
            {this.state.error && (
              <div className="w-full border-t border-slate-200/80 dark:border-white/10 pt-4 text-left">
                <button
                  onClick={this.toggleDetails}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1"
                >
                  <span>Technical Diagnostics</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-[11px] text-red-600 dark:text-red-400 overflow-x-auto max-h-40 leading-normal">
                    <div className="font-bold mb-1">{this.state.error.toString()}</div>
                    {this.state.errorInfo?.componentStack && (
                      <div className="text-slate-500 dark:text-slate-500 text-[10px] whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

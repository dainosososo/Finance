import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl border border-pink-200 shadow-2xl max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">個股技術圖表載入異常</h3>
              <p className="text-xs text-slate-500 mt-1">
                已自動攔截異常，防止頁面崩潰。您可以重試或關閉此視窗。
              </p>
              {this.state.error?.message && (
                <p className="text-[10px] font-mono text-rose-700 bg-rose-50 p-2 rounded-xl mt-2 break-all border border-pink-200">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (this.props.onClose) this.props.onClose();
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                關閉並返回戰情室
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

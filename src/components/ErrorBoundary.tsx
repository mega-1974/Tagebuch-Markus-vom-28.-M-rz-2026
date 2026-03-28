/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorDetails = '';
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          errorDetails = JSON.stringify(parsed, null, 2);
        }
      } catch (e) {
        errorDetails = this.state.error?.message || 'Unknown error';
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] p-6">
          <div className="max-w-xl w-full bg-white rounded-[48px] p-12 shadow-2xl border border-stone-100 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-red-500">
              <AlertTriangle size={40} />
            </div>
            <h2 className="font-serif text-3xl font-medium text-stone-800 mb-4 tracking-tight">
              Ups! Etwas ist schiefgelaufen.
            </h2>
            <p className="text-stone-500 text-sm mb-8 leading-relaxed">
              Es gab ein technisches Problem. Wir haben die Details protokolliert.
            </p>
            
            <div className="bg-stone-50 rounded-3xl p-6 mb-8 text-left overflow-auto max-h-48">
              <pre className="text-[10px] font-mono text-stone-400 whitespace-pre-wrap">
                {errorDetails}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-stone-800 text-white rounded-full font-medium hover:bg-stone-700 transition-all shadow-xl shadow-stone-200"
            >
              <RefreshCcw size={20} />
              App neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

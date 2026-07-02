"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">&#9888;</p>
          <p className="text-xl text-slate-400 mb-2">页面发生错误</p>
          <p className="text-slate-600 mb-6 text-sm">
            {this.state.error?.message || "未知错误"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.hash = "#/";
              window.location.reload();
            }}
            className="btn-primary"
          >
            返回首页
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

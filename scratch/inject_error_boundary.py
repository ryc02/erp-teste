import os

app_path = r"d:\ERP Venner\frontend_react\src\app\App.tsx"

with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

error_boundary = """
import React, { Component, ErrorInfo, ReactNode } from "react";

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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
"""

if "class ErrorBoundary" not in content:
    content = content.replace("export default function App()", "function MainApp()")
    new_export = """
export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
"""
    imports_end = content.find("type Module =")
    
    final_content = content[:imports_end] + error_boundary + "\n" + content[imports_end:] + new_export
    
    with open(app_path, "w", encoding="utf-8") as f:
        f.write(final_content)
    
    print("Error Boundary injected.")
else:
    print("Error Boundary already present.")

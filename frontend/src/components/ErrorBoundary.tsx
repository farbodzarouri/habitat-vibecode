import { Component, type ReactNode } from 'react'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 text-center">
          <h1 className="text-base font-semibold text-ink">Something went wrong</h1>
          <p className="mt-2 text-sm text-ink-secondary">
            The app hit an unexpected error. Reloading usually fixes it.
          </p>
          <p className="mt-3 rounded-lg bg-tan-50 px-3 py-2 text-left text-xs text-ink-muted">
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-cocoa-800 px-4 py-2 text-sm font-medium text-cream hover:bg-cocoa-700"
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}

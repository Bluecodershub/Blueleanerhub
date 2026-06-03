'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string // Name of the component/section for better error tracking
  level?: 'page' | 'section' | 'component' // Error boundary level
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
  retryCount: number
}

export default class ErrorBoundary extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = []

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { name = 'Unknown', onError } = this.props

    // Enhanced error logging
    const errorData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      context: {
        component: name,
        level: this.props.level || 'component',
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
        url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      },
      errorId: this.state.errorId,
    }

    console.error(`[ErrorBoundary:${name}] Component error caught:`, errorData)

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }

    // Report to external error service (e.g., Sentry, LogRocket)
    this.reportError(errorData)

    // Update state with error info
    this.setState({ errorInfo })
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(clearTimeout)
  }

  private reportError = async (errorData: any) => {
    // skip network reporting during tests to avoid noise and potential failures
    if (process.env.NODE_ENV === 'test') {
      return
    }

    try {
      if (typeof window !== 'undefined') {
        await api.post('/errors/report', errorData).catch(() => {
          console.warn('Failed to report error to backend')
        })
      } else {
        console.warn('Skipping error report: window unavailable')
      }
    } catch (e) {
      console.warn('Error reporting failed:', e)
    }
  }

  private handleRetry = () => {
    const maxRetries = 3
    if (this.state.retryCount >= maxRetries) {
      console.warn('Max retry attempts reached')
      return
    }

    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }))

    // Set a timeout to reset retry count after successful recovery
    const timeout = setTimeout(() => {
      this.setState({ retryCount: 0 })
    }, 30000) // Reset after 30 seconds

    this.retryTimeouts.push(timeout)
  }

  private copyErrorDetails = () => {
    if (!this.state.error) return

    const errorDetails = {
      error: this.state.error.toString(),
      stack: this.state.error.stack,
      errorInfo: this.state.errorInfo,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
    }

    navigator.clipboard
      .writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        console.log('Error details copied to clipboard')
        // Could show a toast notification here
      })
      .catch(() => {
        console.warn('Failed to copy error details')
      })
  }

  private renderMinimalError = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
      <div className="flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            Oops! Something went wrong
          </span>
          <span className="text-sm text-red-700 dark:text-red-400">
            Reload this section, or report this error using the Error ID.
          </span>
        </div>
      </div>
      {this.state.errorId && (
        <Badge variant="secondary" className="mt-2 font-mono text-xs">
          Error ID: {this.state.errorId}
        </Badge>
      )}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={this.handleRetry}
        className="mt-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  )

  private renderFullError = () => (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <CardTitle className="mb-2 text-2xl">Oops! Something went wrong</CardTitle>
          <CardDescription>
            {this.props.level === 'page'
              ? "We're sorry for the inconvenience. The page encountered an unexpected error."
              : "This component encountered an error and couldn't render properly."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error ID for support */}
          {this.state.errorId && (
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="font-mono text-xs">
                Error ID: {this.state.errorId}
              </Badge>
            </div>
          )}

          {/* Error details (collapsible) */}
          {this.state.error && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-muted p-4 hover:bg-muted/80">
                <div className="flex items-center">
                  <Bug className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Technical Details</span>
                </div>
                <div className="ml-2 transform transition-transform group-open:rotate-180">▼</div>
              </summary>
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Error Message:</h4>
                  <pre className="overflow-auto rounded bg-muted p-3 text-xs">
                    {this.state.error.message}
                  </pre>
                </div>

                {this.state.error.stack && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Stack Trace:</h4>
                    <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={this.copyErrorDetails}
                    className="text-xs"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy Details
                  </Button>
                </div>
              </div>
            </details>
          )}

          {/* Recovery actions */}
          <div className="flex justify-center gap-3 pt-4">
            <Button
              type="button"
              onClick={this.handleRetry}
              disabled={this.state.retryCount >= 3}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {this.state.retryCount >= 3
                ? 'Max Retries'
                : `Try Again ${this.state.retryCount > 0 ? `(${this.state.retryCount}/3)` : ''}`}
            </Button>

            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>

            <Button type="button" variant="outline" onClick={() => (window.location.href = '/')}>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Help text */}
          <div className="border-t pt-4 text-center text-sm text-muted-foreground">
            If the problem persists, please contact support with the error ID above.
          </div>
        </CardContent>
      </Card>
    </div>
  )

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Render different UIs based on error level
      switch (this.props.level) {
        case 'page':
          return this.renderFullError()
        case 'section':
          return this.renderFullError()
        case 'component':
        default:
          return this.renderMinimalError()
      }
    }

    return this.props.children
  }
}

// Specialized error boundaries for different use cases
export class PageErrorBoundary extends Component<Omit<Props, 'level'>, State> {
  render() {
    return (
      <ErrorBoundary {...this.props} level="page">
        {this.props.children}
      </ErrorBoundary>
    )
  }
}

export class SectionErrorBoundary extends Component<Omit<Props, 'level'>, State> {
  render() {
    return (
      <ErrorBoundary {...this.props} level="section">
        {this.props.children}
      </ErrorBoundary>
    )
  }
}

export class ComponentErrorBoundary extends Component<Omit<Props, 'level'>, State> {
  render() {
    return (
      <ErrorBoundary {...this.props} level="component">
        {this.props.children}
      </ErrorBoundary>
    )
  }
}

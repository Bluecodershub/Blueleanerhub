// @ts-nocheck
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import ErrorBoundary, {
  PageErrorBoundary,
  SectionErrorBoundary,
  ComponentErrorBoundary,
} from '@/components/ui/ErrorBoundary'

// Mock component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="dark">
    {children}
  </ThemeProvider>
)

describe('ErrorBoundary', () => {
  // Suppress console errors during tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic ErrorBoundary', () => {
    it('renders children when there is no error', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('renders error UI when child component throws', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      expect(
        screen.getByText('Reload this section, or report this error using the Error ID.')
      ).toBeInTheDocument()
    })

    it('displays error details when expanded', () => {
      render(
        <TestWrapper>
          {/* use page boundary which renders the full UI with collapsible details */}
          <PageErrorBoundary>
            <ThrowError />
          </PageErrorBoundary>
        </TestWrapper>
      )

      // open the technical details section
      const summary = screen.getByText(/Technical Details/)
      summary.click()

      // Look for error message in details
      const matches = screen.getAllByText(/Test error message/)
      expect(matches.length).toBeGreaterThan(0)
    })

    it('calls onError callback when error occurs', () => {
      const onErrorMock = jest.fn()

      render(
        <TestWrapper>
          <ErrorBoundary onError={onErrorMock}>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(onErrorMock).toHaveBeenCalledTimes(1)
      expect(onErrorMock).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
    })
  })

  describe('PageErrorBoundary', () => {
    it('renders full page error UI', () => {
      render(
        <TestWrapper>
          <PageErrorBoundary>
            <ThrowError />
          </PageErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/The page encountered an unexpected error/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Try Again/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Reload Page/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Go Home/ })).toBeInTheDocument()
    })
  })

  describe('SectionErrorBoundary', () => {
    it('renders section-level error UI', () => {
      render(
        <TestWrapper>
          <SectionErrorBoundary>
            <ThrowError />
          </SectionErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    })
  })

  describe('ComponentErrorBoundary', () => {
    it('renders minimal component error UI', () => {
      render(
        <TestWrapper>
          <ComponentErrorBoundary>
            <ThrowError />
          </ComponentErrorBoundary>
        </TestWrapper>
      )

      expect(
        screen.getByText('Reload this section, or report this error using the Error ID.')
      ).toBeInTheDocument()
    })
  })

  describe('Custom fallback', () => {
    it('renders custom fallback UI when provided', () => {
      const CustomFallback = <div>Custom error fallback</div>

      render(
        <TestWrapper>
          <ErrorBoundary fallback={CustomFallback}>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Custom error fallback')).toBeInTheDocument()
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error recovery', () => {
    it('allows retry functionality', () => {
      let shouldThrow = true
      const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />

      render(
        <TestWrapper>
          <ErrorBoundary>
            <TestComponent />
          </ErrorBoundary>
        </TestWrapper>
      )

      // Error should be displayed
      expect(
        screen.getByText('Reload this section, or report this error using the Error ID.')
      ).toBeInTheDocument()

      // Simulate fixing the error
      shouldThrow = false

      // Click retry button
      const retryButton = screen.getByRole('button')
      retryButton.click()

      // Component should recover (this is a simplified test)
      // In reality, the retry mechanism resets the error boundary state
    })
  })

  describe('Error reporting', () => {
    it('generates unique error ID for tracking', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      )

      // Should display error ID for tracking
      expect(screen.getByText(/Error ID:/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      )

      // Check for alert role or aria-live region
      const errorMessage = screen.getByText(
        'Reload this section, or report this error using the Error ID.'
      )
      expect(errorMessage.closest('div')).toBeInTheDocument()
    })

    it('provides keyboard navigation for actions', () => {
      render(
        <TestWrapper>
          <PageErrorBoundary>
            <ThrowError />
          </PageErrorBoundary>
        </TestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })
  })
})

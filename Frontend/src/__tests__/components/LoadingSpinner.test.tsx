/**
 * Loading Spinner Component Tests
 */
import React from 'react'
import { render, screen } from '@testing-library/react'

// Simple Loading Spinner component
const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div
      data-testid="loading-spinner"
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

const LoadingOverlay = ({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) => {
  if (!isLoading) return <>{children}</>

  return (
    <div data-testid="loading-overlay" className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/50">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  )
}

const SkeletonCard = () => (
  <div data-testid="skeleton-card" className="animate-pulse bg-gray-200 rounded-lg p-4">
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-300 rounded w-1/2" />
  </div>
)

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default size', () => {
      render(<LoadingSpinner />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveAttribute('role', 'status')
      expect(screen.getByText('Loading...')).toHaveClass('sr-only')
    })

    it('renders different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />)
      expect(screen.getByTestId('loading-spinner')).toHaveClass('w-4', 'h-4')

      rerender(<LoadingSpinner size="md" />)
      expect(screen.getByTestId('loading-spinner')).toHaveClass('w-8', 'h-8')

      rerender(<LoadingSpinner size="lg" />)
      expect(screen.getByTestId('loading-spinner')).toHaveClass('w-12', 'h-12')
    })

    it('applies custom className', () => {
      render(<LoadingSpinner className="text-blue-500" />)
      expect(screen.getByTestId('loading-spinner')).toHaveClass('text-blue-500')
    })
  })

  describe('LoadingOverlay', () => {
    it('renders children when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument()
    })

    it('renders overlay with spinner when loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      )

      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveClass('opacity-50')
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('SkeletonCard', () => {
    it('renders skeleton placeholder', () => {
      render(<SkeletonCard />)
      expect(screen.getByTestId('skeleton-card')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-card')).toHaveClass('animate-pulse')
    })
  })
})

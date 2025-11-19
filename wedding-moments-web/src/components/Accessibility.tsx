import { ReactNode } from 'react'

// Skip to main content link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-pink-600 focus:text-white focus:rounded-lg focus:shadow-lg"
    >
      メインコンテンツへスキップ
    </a>
  )
}

// Visually hidden text (for screen readers)
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Focus trap for modals
export function useFocusTrap(isActive: boolean) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab') return

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }
}

// ARIA live region for announcements
export function LiveRegion({ 
  message, 
  politeness = 'polite' 
}: { 
  message: string
  politeness?: 'polite' | 'assertive' 
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Accessible button with loading state
export function AccessibleButton({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ariaLabel,
  ...props
}: {
  children: ReactNode
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  ariaLabel?: string
  [key: string]: any
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      className={`${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      {isLoading && (
        <span className="sr-only">読み込み中...</span>
      )}
      {children}
    </button>
  )
}

// Accessible form field
export function FormField({
  label,
  error,
  required = false,
  children,
  helpText,
}: {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
  helpText?: string
}) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`
  const errorId = `${id}-error`
  const helpId = `${id}-help`

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-600 ml-1" aria-label="必須">
            *
          </span>
        )}
      </label>
      
      <div>
        {children}
      </div>
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible modal dialog
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal content */}
        <div
          className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full`}
        >
          <div className="p-6">
            <h2 id="modal-title" className="text-xl font-bold mb-4">
              {title}
            </h2>
            
            {children}
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="閉じる"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Keyboard navigation helper
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void
) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        onEnter?.()
        break
      case 'Escape':
        onEscape?.()
        break
      case 'ArrowUp':
        e.preventDefault()
        onArrowUp?.()
        break
      case 'ArrowDown':
        e.preventDefault()
        onArrowDown?.()
        break
    }
  }

  return handleKeyDown
}

// Announce to screen readers
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', politeness)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

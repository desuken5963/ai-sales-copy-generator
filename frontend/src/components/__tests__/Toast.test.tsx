import { render, screen, act } from '@testing-library/react'
import { Toast } from '../Toast'

describe('Toast', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    mockOnClose.mockClear()
  })

  it('renders correctly with success type', () => {
    const { container } = render(<Toast type="success" message="Operation successful" onClose={mockOnClose} />)
    const toast = screen.getByText('Operation successful')
    expect(toast).toBeInTheDocument()
    const toastContainer = container.querySelector('.bg-green-500')
    expect(toastContainer).toHaveClass('bg-green-500', 'text-white')
  })

  it('renders correctly with error type', () => {
    const { container } = render(<Toast type="error" message="Operation failed" onClose={mockOnClose} />)
    const toast = screen.getByText('Operation failed')
    expect(toast).toBeInTheDocument()
    const toastContainer = container.querySelector('.bg-red-500')
    expect(toastContainer).toHaveClass('bg-red-500', 'text-white')
  })

  it('calls onClose after 3 seconds', () => {
    render(<Toast type="success" message="Operation successful" onClose={mockOnClose} />)
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
}) 
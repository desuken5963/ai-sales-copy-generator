import { render, screen, fireEvent } from '@testing-library/react'
import { Toggle } from '../Toggle'

describe('Toggle', () => {
  it('renders correctly with default props', () => {
    const handleChange = jest.fn()
    render(<Toggle checked={false} onChange={handleChange} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('renders correctly with label', () => {
    const handleChange = jest.fn()
    render(<Toggle label="Toggle" checked={false} onChange={handleChange} />)
    expect(screen.getByText('Toggle')).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Toggle checked={false} onChange={handleChange} />)
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('renders correctly when checked', () => {
    const handleChange = jest.fn()
    render(<Toggle checked={true} onChange={handleChange} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
}) 
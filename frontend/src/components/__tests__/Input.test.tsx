import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../Input'

describe('Input', () => {
  it('renders correctly with default props', () => {
    render(<Input label="Name" />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input label="Name" onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'John' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders error message when provided', () => {
    render(<Input label="Name" error="This field is required" />)
    const errorMessage = screen.getByText('This field is required')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveClass('text-red-500')
  })

  it('renders correctly when disabled', () => {
    render(<Input label="Name" disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })
}) 